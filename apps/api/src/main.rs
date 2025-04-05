mod config;
mod models;
mod openapi;
mod routes;
mod spotify;
mod spotify_embed;
mod sync;

use anyhow::{Result, anyhow};
use reqwest::Method;
use scraper::{Html, Selector};
use serde::Serialize;
use sqlx::mysql::MySqlPoolOptions;
use sqlx::prelude::FromRow;
use sqlx::{MySql, Pool};
use std::collections::HashMap;
use std::env;
use std::path::Path as StdPath;
use std::process::Stdio;
use std::sync::Arc;
use tokio::fs::File;
use tokio::io::{AsyncReadExt, AsyncSeekExt, AsyncWriteExt};
use tokio::sync::{Mutex, Notify};
use tower_http::cors::CorsLayer;
use tracing::{Level, span};
use utoipa::OpenApi;
use utoipa::openapi::LicenseBuilder;
use utoipa_axum::router::OpenApiRouter;
use utoipa_scalar::{Scalar, Servable as ScalarServable};

use axum::body::Body;
use axum::extract::{Path, State};
use axum::http::{HeaderMap, HeaderValue, StatusCode};
use axum::response::{IntoResponse, Response};
use axum::routing::get;
use axum::{Json, Router};
use tokio::process::Command;
use tokio_util::io::ReaderStream;

use once_cell::sync::Lazy;

use self::config::{MachinaConfig, get_config};
use self::spotify_embed::EmbedJsonData;
use self::sync::start_sync_loop;

#[derive(Clone)]
struct AppState {
    generation_tasks: Arc<Mutex<HashMap<String, Arc<Notify>>>>,
    db: &'static Pool<MySql>,
    // config: MachinaConfig,
}

#[derive(OpenApi)]
#[openapi(
        tags(
            (name = "default", description = "default api")
        )
    )]
pub struct ApiDoc;

static GLOBAL_DB_POOL: Lazy<Arc<Mutex<Option<&'static Pool<MySql>>>>> =
    Lazy::new(|| Arc::new(Mutex::new(None)));

static MACHINA_CONFIG: Lazy<MachinaConfig> = Lazy::new(|| get_config().expect("config"));

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .compact()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| {
                format!("{}=debug,axum::rejection=trace", env!("CARGO_CRATE_NAME")).into()
            }),
        )
        .init();

    let pool = MySqlPoolOptions::new()
        .max_connections(5)
        .connect(&MACHINA_CONFIG.database_url)
        .await
        .expect("failed to connect to database");

    let static_pool: &'static Pool<MySql> = Box::leak(Box::new(pool));

    let state = AppState {
        generation_tasks: Arc::new(Mutex::new(HashMap::new())),
        db: static_pool,
    };

    {
        let mut db_pool = GLOBAL_DB_POOL.lock().await;
        *db_pool = Some(static_pool);
    }

    let base_router = routes::router(state.clone());

    let mut doc = ApiDoc::openapi();
    doc.info.license = Some(
        LicenseBuilder::new()
            .name("MIT")
            .identifier(Some("MIT"))
            .build(),
    );

    let cors = CorsLayer::new()
        .allow_methods([Method::GET, Method::POST])
        .allow_origin(
            MACHINA_CONFIG
                .app_url
                .trim_end_matches('/')
                .parse::<HeaderValue>()
                .unwrap(),
        );

    let (openapi_router, api) = OpenApiRouter::with_openapi(ApiDoc::openapi())
        .nest("/api", base_router)
        .split_for_parts();

    let app = Router::new()
        .route("/{trackId}", get(root))
        .route("/openapi.json", get(Json(api.clone())))
        .with_state(state.clone());

    let openapi_router = openapi_router
        .merge(app)
        .merge(Scalar::with_url("/scalar", api))
        .layer(cors);

    start_sync_loop(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001").await.unwrap();
    tracing::info!("listening on :3001");
    axum::serve(listener, openapi_router.into_make_service())
        .await
        .unwrap();
}

async fn get_cached_video(track_id: String) -> Option<File> {
    let dir_path = format!("/tmp/machina/{}/", track_id);
    let dir = StdPath::new(&dir_path);
    if dir.exists() {
        tracing::info!("found cached {} directory", track_id);
        return File::open(dir_path + "out.mp4").await.ok();
    }

    None
}

async fn serve_cached_video(
    track_id: String,
    range: Option<&HeaderValue>,
) -> Result<Response, (StatusCode, String)> {
    if let Some(file) = get_cached_video(track_id.clone()).await {
        tracing::info!("found cached {} out.mp4", track_id);
        let metadata = file.metadata().await.map_err(|_| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                "failed to read metadata from existing video".to_string(),
            )
        })?;
        let total_size = metadata.len();

        // handle range header for video seeking
        if let Some(range) = range {
            if let Ok(range) = range.to_str() {
                if let Some(range) = parse_range_header(range, total_size) {
                    let (start, end) = range;

                    let mut partial_file = file;
                    partial_file
                        .seek(tokio::io::SeekFrom::Start(start))
                        .await
                        .unwrap();

                    let length = end - start + 1;
                    let stream = ReaderStream::new(partial_file.take(length));

                    let body = Body::from_stream(stream);

                    let response = axum::response::Response::builder()
                        .status(StatusCode::PARTIAL_CONTENT)
                        .header("Content-Type", "video/mp4")
                        .header(
                            "Content-Range",
                            format!("bytes {}-{}/{}", start, end, total_size),
                        )
                        .body(body)
                        .unwrap();

                    return Ok(response);
                }
            }

            return create_video_response(file).await;
        }

        return create_video_response(file).await;
    }

    Err((StatusCode::INTERNAL_SERVER_ERROR, "error".to_string()))
}

#[derive(FromRow, Serialize)]
struct Listen {
    id: String,
    time: i64,
    name: String,
    duration: Option<i32>,
    explicit: Option<i8>,
    artist_id: Option<String>,
    album_id: Option<String>,
    album_name: Option<String>,
    cover_art: Option<String>,
    artist_name: Option<String>,
}

#[axum::debug_handler]
async fn root(
    Path(track_id_path): Path<String>,
    headers: HeaderMap,
    State(state): State<AppState>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    if track_id_path.starts_with("favicon") {
        return Err((
            StatusCode::BAD_REQUEST,
            "we dont have a favicon".to_string(),
        ));
    }

    let track_id = track_id_path.split('.').next().unwrap_or("").to_string();
    let dir_path = format!("/tmp/machina/{}/", track_id);
    let span = span!(Level::INFO, "generate", track_id = track_id);
    let _enter = span.enter();

    let range = headers.get("Range");
    if get_cached_video(track_id.clone()).await.is_some() {
        return serve_cached_video(track_id, range).await;
    }

    let mut is_leader = false;
    let notify = {
        let mut tasks = state.generation_tasks.lock().await;
        if let Some(existing_notify) = tasks.get(&track_id) {
            Arc::clone(existing_notify)
        } else {
            let notify = Arc::new(Notify::new());
            tasks.insert(track_id.clone(), Arc::clone(&notify));
            is_leader = true;
            notify
        }
    };

    if !is_leader {
        tracing::info!("waiting for leader to complete video");
        notify.notified().await;
        return serve_cached_video(track_id, range).await;
    }

    tracing::info!("we are the leader");

    if get_cached_video(track_id.clone()).await.is_some() {
        return serve_cached_video(track_id, range).await;
    }

    let file = generate_video_from_id(track_id.clone(), dir_path.clone()).await;
    if let Err(err) = file {
        tracing::error!("Error generating video: {:?}", err);
        {
            let mut tasks = state.generation_tasks.lock().await;
            tasks.remove(&track_id);
        }
        return Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            "Error generating video".to_string(),
        ));
    }

    tracing::info!("video complete, notifying waiters");

    {
        let mut tasks = state.generation_tasks.lock().await;
        if let Some(notify) = tasks.remove(&track_id) {
            notify.notify_waiters();
        }
    }

    create_video_response(file.unwrap()).await
}

async fn create_video_response(file: File) -> Result<Response, (StatusCode, String)> {
    tracing::info!("got output file");
    let metadata = file.metadata().await.map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "failed to read metadata from existing video".to_string(),
        )
    })?;

    let total_size = metadata.len();

    let stream = ReaderStream::new(file);
    let body = Body::from_stream(stream);

    let response = axum::response::Response::builder()
        .status(StatusCode::OK)
        .header("Content-Type", "video/mp4")
        .header("Content-Length", total_size.to_string())
        .body(body)
        .unwrap();

    Ok(response)
}

async fn get_track_og(track_id: &String, dir: String) -> Result<File> {
    tracing::info!("fetching og image");
    let response = reqwest::get(format!(
        "{}/direct/https:/open.spotify.com/track/{}",
        MACHINA_CONFIG.app_url, track_id
    ))
    .await?;

    let bytes = response.bytes().await?;
    let full_path = dir + "og.png";
    let path = StdPath::new(&full_path);
    if let Some(parent) = path.parent() {
        tracing::info!("cache folder for {} did not exist, creating...", track_id);
        tokio::fs::create_dir_all(parent).await?;
    }

    let mut file = File::create(path).await?;
    file.write_all(&bytes).await?;
    file.flush().await?;
    tracing::info!("finished fetching og");
    Ok(file)
}

async fn get_preview_url(track_id: &String) -> Result<String> {
    tracing::info!("fetching preview url for {}", track_id);
    let response =
        reqwest::get(format!("https://open.spotify.com/embed/track/{}", track_id)).await?;
    let html_content = response.text().await?;

    let document = Html::parse_document(&html_content);
    let selector = Selector::parse("#__NEXT_DATA__").unwrap();
    let element = document
        .select(&selector)
        .next()
        .ok_or(anyhow!("failed to find __NEXT_DATA__"))?;
    let json_text = element.text().collect::<Vec<_>>().concat();

    let json: EmbedJsonData = serde_json::from_str(&json_text)?;
    let preview_url = json.props.page_props.state.data.entity.audio_preview.url;
    tracing::info!("found preview url for {} - {}", track_id, preview_url);
    Ok(preview_url)
}

async fn get_track_preview_audio(track_id: String, dir: String) -> Result<File> {
    tracing::info!("fetching preview audio");
    let preview_url = get_preview_url(&track_id).await?;
    let response = reqwest::get(preview_url).await?;

    let bytes = response.bytes().await?;
    let full_path = dir + "audio.mp3";
    let path = StdPath::new(&full_path);
    if let Some(parent) = path.parent() {
        tracing::info!("cache folder for {} did not exist, creating...", track_id);
        tokio::fs::create_dir_all(parent).await?;
    }

    let mut file = File::create(path).await?;
    file.write_all(&bytes).await?;
    file.flush().await?;
    tracing::info!("finished fetching preview audio");
    Ok(file)
}

async fn generate_video_from_id(track_id: String, dir: String) -> Result<File> {
    tracing::info!("preparing assets for video");
    get_track_og(&track_id, dir.clone()).await?;
    get_track_preview_audio(track_id, dir.clone()).await?;
    Command::new("ffmpeg")
        .args([
            "-loop",
            "1",
            "-i",
            "og.png",
            "-i",
            "audio.mp3",
            "-c:v",
            "libx264",
            "-preset",
            "ultrafast",
            "-tune",
            "stillimage",
            "-crf",
            "23",
            "-c:a",
            "aac",
            "-b:a",
            "128k",
            "-aac_coder",
            "fast",
            "-pix_fmt",
            "yuv420p",
            "-threads",
            "0",
            "-shortest",
            "out.mp4",
        ])
        .current_dir(dir.clone())
        .stdout(Stdio::piped())
        .output()
        .await?;
    let out_file_path = dir + "out.mp4";
    let out_file = File::open(out_file_path).await.ok();

    tracing::info!("generated video");
    out_file.ok_or(anyhow!("no file got created"))
}

fn parse_range_header(range: &str, total_size: u64) -> Option<(u64, u64)> {
    if !range.starts_with("bytes=") {
        return None;
    }

    let range = &range[6..]; // strip "bytes="
    let parts: Vec<&str> = range.split('-').collect();

    if parts.len() != 2 {
        return None;
    }

    let start = parts[0].parse::<u64>().ok()?;
    let end = if parts[1].is_empty() {
        total_size - 1
    } else {
        parts[1].parse::<u64>().ok()?
    };

    if start <= end && end < total_size {
        Some((start, end))
    } else {
        None
    }
}
