mod cache_manager;
mod config;
mod models;
mod openapi;
mod preview;
mod routes;
mod spotify;
mod spotify_embed;
mod sync;
mod utils;

use backblaze_b2_client::client::B2Client;
use reqwest::Method;
use sqlx::mysql::MySqlPoolOptions;
use sqlx::{MySql, Pool};
use std::collections::HashMap;
use std::env;
use std::sync::Arc;
use tokio::fs::{self};
use tokio::sync::{Mutex, Notify};
use tokio::task;
use tower_http::cors::CorsLayer;
use utoipa::OpenApi;
use utoipa::openapi::LicenseBuilder;
use utoipa_axum::router::OpenApiRouter;
use utoipa_scalar::{Scalar, Servable as ScalarServable};

use axum::http::HeaderValue;
use axum::routing::get;
use axum::{Json, Router};

use once_cell::sync::{Lazy, OnceCell};

use self::cache_manager::CacheManger;
use self::config::{MachinaConfig, get_config};
use self::preview::{B2Video, LocalVideo, LocalVideoError, get_preview_video};
use self::sync::start_sync_loop;
use self::utils::{get_track_output_path, get_video_output_path, upload_to_b2};

#[derive(Clone)]
struct AppState {
    cache_manager: Arc<CacheManger>,
    generation_tasks: Arc<Mutex<HashMap<String, Arc<Notify>>>>,
    db: &'static Pool<MySql>,
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

static B2: OnceCell<B2Client> = OnceCell::new();

pub fn get_b2() -> &'static B2Client {
    B2.get().expect("b2 client not set")
}

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

    let b2 = B2Client::new(
        MACHINA_CONFIG.b2_application_key_id.clone(),
        MACHINA_CONFIG.b2_application_key.clone(),
    )
    .await
    .expect("b2");

    let _ = B2.set(b2);

    let state = AppState {
        cache_manager: Arc::new(CacheManger::new()),
        generation_tasks: Arc::new(Mutex::new(HashMap::new())),
        db: static_pool,
    };

    task::spawn(cache_upload_existing_tmp(state.cache_manager.clone()));

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
        .route("/{trackId}", get(get_preview_video))
        .route("/openapi.json", get(Json(api.clone())))
        .with_state(state.clone());

    let openapi_router = openapi_router
        .merge(app)
        .merge(Scalar::with_url("/scalar", api))
        .layer(cors);

    state.cache_manager.start_cleanup_thread();
    start_sync_loop(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001").await.unwrap();
    tracing::info!("listening on :3001");
    axum::serve(listener, openapi_router.into_make_service())
        .await
        .unwrap();
}

async fn cache_upload_existing_tmp(cache_manager: Arc<CacheManger>) {
    tracing::debug!(
        "checking {} for existing generated videos",
        MACHINA_CONFIG.video_generator_dir
    );
    let mut entries = fs::read_dir(MACHINA_CONFIG.video_generator_dir.clone())
        .await
        .unwrap();
    while let Some(entry) = entries.next_entry().await.unwrap() {
        let path = entry.path();
        if path.is_dir() {
            if let Some(folder_name) = path.file_name() {
                if let Some(track_id) = folder_name.to_str() {
                    tracing::debug!("found track {:?} in tmp, uploading to b2", track_id);
                    let local_video = LocalVideo::new(
                        track_id.to_string(),
                        get_video_output_path(track_id.to_string()),
                    )
                    .await;

                    if let Ok(video) = local_video {
                        let _ = cache_manager.cache_video(&video).await;
                        // if we error there was no b2 video so we should upload
                        if B2Video::new(track_id.to_string()).await.is_err() {
                            upload_to_b2(cache_manager.clone(), track_id.to_string()).await;
                        }
                    }

                    let _ = fs::remove_dir_all(get_track_output_path(track_id.to_string())).await;
                    tracing::debug!("deleted tmp directory for {}", track_id);
                }
            }
        }
    }
}
