use crate::spotify_embed::EmbedJsonData;
use crate::utils::{
    get_audio_output_path, get_b2_video_path, get_og_output_path, get_track_output_path,
    get_video_output_path, upload_to_b2,
};
use crate::{AppState, MACHINA_CONFIG, get_b2};
use anyhow::{Result, anyhow};
use axum::extract::{Path, State};
use axum::http::{HeaderMap, StatusCode};
use axum::response::{IntoResponse, Response};
use backblaze_b2_client::definitions::query_params::{
    B2DownloadFileQueryParameters, B2ListFileNamesQueryParameters,
};
use bytes::Bytes;
use futures::stream::StreamExt;
use reqwest::header;
use scraper::{Html, Selector};
use std::path::Path as StdPath;
use std::process::Stdio;
use std::sync::Arc;
use tokio::fs::{self, File};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::process::Command;
use tokio::sync::Notify;
use tokio::task;
use tracing::instrument;

#[derive(Debug, thiserror::Error)]
pub enum B2VideoError {
    #[error("video with prefix {0} was not found")]
    NotFound(String),
}

#[derive(Debug, thiserror::Error)]
pub enum LocalVideoError {
    #[error("no video found on path {0}")]
    NotFound(String),
}

pub struct LocalVideo {
    path: String,
    track_id: String,
}

impl LocalVideo {
    pub async fn new(track_id: String, path: String) -> Result<LocalVideo, LocalVideoError> {
        let path_path = std::path::Path::new(&path);
        if !path_path.exists() {
            return Err(LocalVideoError::NotFound(path));
        }

        Ok(LocalVideo { track_id, path })
    }
}

impl StoredVideo for LocalVideo {
    async fn get_file_stream_all(&self) -> Result<Bytes, StoredVideoError> {
        let mut file = File::open(self.path.clone())
            .await
            .map_err(|_| StoredVideoError::StreamError)?;
        let metadata = file
            .metadata()
            .await
            .map_err(|_| StoredVideoError::StreamError)?;
        let file_size = metadata.len() as usize;

        let mut buffer: Vec<u8> = Vec::with_capacity(file_size);

        file.read_to_end(&mut buffer).await.unwrap();

        Ok(Bytes::from(buffer))
    }

    fn get_id(&self) -> String {
        self.track_id.clone()
    }
}

pub struct B2Video {
    pub file_id: String,
    pub track_id: String,
}

impl B2Video {
    pub async fn new(track_id: String) -> Result<B2Video, B2VideoError> {
        let files = get_b2()
            .basic_client()
            .list_file_names(
                B2ListFileNamesQueryParameters::builder()
                    .bucket_id(MACHINA_CONFIG.b2_bucket_id.clone())
                    .prefix(Some(get_b2_video_path(track_id.clone())))
                    .build(),
            )
            .await
            .unwrap();

        if !files.files.is_empty() {
            let file = files.files.first().unwrap();
            tracing::info!("found video for track in b2");
            return Ok(B2Video {
                file_id: file.file_id.clone(),
                track_id,
            });
        }

        Err(B2VideoError::NotFound(track_id.clone()))
    }
}

impl StoredVideo for B2Video {
    fn get_id(&self) -> String {
        self.track_id.clone()
    }

    async fn get_file_stream_all(&self) -> Result<Bytes, StoredVideoError> {
        let video = get_b2()
            .basic_client()
            .download_file_by_id(
                self.file_id.clone(),
                Some(B2DownloadFileQueryParameters::builder().build()),
            )
            .await
            .unwrap();
        let (size, mut stream) = video.file.into_stream();

        let mut buffer: Vec<u8> = Vec::with_capacity(size);

        while let Some(value) = stream.next().await {
            let value = value.map_err(|_| StoredVideoError::StreamError)?;
            buffer.extend_from_slice(value.as_ref());
        }

        Ok(Bytes::from(buffer))
    }
}

pub trait StoredVideo {
    fn get_id(&self) -> String;

    async fn get_file_stream_all(&self) -> Result<Bytes, StoredVideoError>;
}

#[derive(Debug, thiserror::Error)]
pub enum StoredVideoError {
    #[error("an error occured while streaming video data")]
    StreamError,
}

pub async fn serve_cached_video(
    state: AppState,
    track_id: String,
) -> Result<Response, (StatusCode, String)> {
    if let Some(bytes) = state
        .cache_manager
        .get_and_cache_video_bytes(&track_id)
        .await
    {
        Ok(build_response(bytes))
    } else {
        Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            "an error has occured".to_string(),
        ))
    }
}

async fn get_track_og(track_id: String) -> Result<File> {
    tracing::info!("fetching og image");
    let response = reqwest::get(format!(
        "{}/direct/https:/open.spotify.com/track/{}",
        MACHINA_CONFIG.app_url, track_id
    ))
    .await?;

    let bytes = response.bytes().await?;
    let full_path = get_og_output_path(track_id.clone());
    let path = StdPath::new(&full_path);
    if let Some(parent) = path.parent() {
        tracing::info!("cache folder did not exist, creating...");
        tokio::fs::create_dir_all(parent).await?;
    }

    let mut file = File::create(path).await?;
    file.write_all(&bytes).await?;
    file.flush().await?;
    tracing::info!("finished fetching og");
    Ok(file)
}

async fn get_preview_url(track_id: &String) -> Result<String> {
    tracing::info!("fetching preview url");
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
    tracing::info!("found preview url - {}", preview_url);
    Ok(preview_url)
}

async fn get_track_preview_audio(track_id: String) -> Result<File> {
    tracing::info!("fetching preview audio");
    let preview_url = get_preview_url(&track_id).await?;
    let response = reqwest::get(preview_url).await?;

    let bytes = response.bytes().await?;
    let full_path = get_audio_output_path(track_id.clone());
    let path = StdPath::new(&full_path);
    if let Some(parent) = path.parent() {
        tracing::info!("cache folderdid not exist, creating...");
        tokio::fs::create_dir_all(parent).await?;
    }

    let mut file = File::create(path).await?;
    file.write_all(&bytes).await?;
    file.flush().await?;
    tracing::info!("finished fetching preview audio");
    Ok(file)
}

#[instrument(name = "ffmpeg::generate", skip_all)]
async fn generate_video_from_id(track_id: String) -> Result<File> {
    tracing::info!("preparing assets for video");
    let (track_og, preview_audio) = tokio::join!(
        get_track_og(track_id.clone()),
        get_track_preview_audio(track_id.clone())
    );
    // this looks silly
    track_og?;
    preview_audio?;

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
        .current_dir(get_track_output_path(track_id.clone()))
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .await?;

    let out_file = File::open(get_video_output_path(track_id)).await.ok();

    tracing::info!("generated video");
    out_file.ok_or(anyhow!("no file got created"))
}

#[axum::debug_handler]
#[instrument(name = "video-preview", skip(state, track_id_path), fields(track_id = track_id_path))]
pub async fn get_preview_video(
    Path(track_id_path): Path<String>,
    State(state): State<AppState>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    if track_id_path.starts_with("favicon") {
        return Err((
            StatusCode::BAD_REQUEST,
            "we dont have a favicon".to_string(),
        ));
    }
    let track_id = track_id_path.split('.').next().unwrap_or("").to_string();
    if track_id.is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            "you must include an id for the video".to_string(),
        ));
    }

    if let Some(bytes) = state
        .cache_manager
        .get_and_cache_video_bytes(&track_id)
        .await
    {
        return Ok(build_response(bytes));
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
        return serve_cached_video(state, track_id).await;
    }

    tracing::info!("we are the leader");

    if state.cache_manager.has_id(&track_id).await {
        return serve_cached_video(state, track_id).await;
    }

    let file = generate_video_from_id(track_id.clone()).await;
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

    let _ = state
        .cache_manager
        .cache_video(
            &LocalVideo::new(track_id.clone(), get_video_output_path(track_id.clone()))
                .await
                .unwrap(),
        )
        .await;

    let cloned_track_id = track_id.clone();
    let cloned_cache_manager = state.cache_manager.clone();
    task::spawn(async move {
        // if we error there was no b2 video so we should upload
        if B2Video::new(cloned_track_id.clone()).await.is_err() {
            upload_to_b2(cloned_cache_manager, cloned_track_id.clone()).await;
        }
        let _ = fs::remove_dir_all(get_track_output_path(cloned_track_id)).await;
    });

    tracing::info!("video complete, notifying waiters");

    {
        let mut tasks = state.generation_tasks.lock().await;
        if let Some(notify) = tasks.remove(&track_id) {
            notify.notify_waiters();
        }
    }

    serve_cached_video(state, track_id).await
}

fn build_response(video_bytes: Bytes) -> Response {
    let mut headers = HeaderMap::new();
    headers.insert(header::ACCEPT_RANGES, "bytes".parse().unwrap());
    headers.insert(header::CONTENT_TYPE, "video/mp4".parse().unwrap());
    (StatusCode::OK, headers, video_bytes).into_response()
}
