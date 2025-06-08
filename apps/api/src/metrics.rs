use axum::extract::State;
use axum::response::IntoResponse;
use lazy_static::lazy_static;
use prometheus::Encoder;
use prometheus::Gauge;
use prometheus::Histogram;
use prometheus::IntCounter;
use prometheus::TextEncoder;
use prometheus::{register_gauge, register_histogram, register_int_counter};
use reqwest::StatusCode;
use sqlx::MySql;
use sqlx::Pool;
use sqlx::prelude::FromRow;
use sqlx::query_file_as;
use tracing::instrument;

use crate::AppState;

lazy_static! {
    pub static ref FAILED_VIDEO_GENERATIONS: IntCounter = register_int_counter!(
        "failed_video_generations",
        "Number of videos that failed to generate",
    )
    .unwrap();
}

lazy_static! {
    pub static ref VIDEO_GEN_DURATION: Histogram = register_histogram!(
        "video_generation_duration_seconds",
        "Duration of video generation in seconds",
        vec![
            0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5,
            9.0, 9.5, 10.0, 10.5, 11.0, 11.5, 12.0, 12.5, 13.0, 13.5, 14.0, 14.5, 15.0
        ]
    )
    .unwrap();
}

// DB totals
lazy_static::lazy_static! {
    static ref TOTAL_ACCOUNTS: Gauge = register_gauge!(
        "total_accounts",
        "Total number of accounts linked"
    ).unwrap();
}
lazy_static::lazy_static! {
    static ref TOTAL_ALBUMS: Gauge = register_gauge!(
        "total_albums",
        "Total number of albums stored"
    ).unwrap();
}
lazy_static::lazy_static! {
    static ref TOTAL_ARTISTS: Gauge = register_gauge!(
        "total_artists",
        "Total number of artists stored"
    ).unwrap();
}
lazy_static::lazy_static! {
    static ref  TOTAL_LISTENS: Gauge = register_gauge!(
        "total_listens",
        "Total number of listens tracked"
    ).unwrap();
}
lazy_static::lazy_static! {
    static ref TOTAL_TRACKS: Gauge = register_gauge!(
        "total_tracks",
        "Total number of tracks stored"
    ).unwrap();
}
lazy_static::lazy_static! {
    static ref TOTAL_USERS: Gauge = register_gauge!(
        "total_users",
        "Total number of users registered"
    ).unwrap();
}

pub fn metric_setup() {
    FAILED_VIDEO_GENERATIONS.reset();
}

#[derive(Debug, FromRow)]
struct TableCounts {
    account: i64,
    album: i64,
    artist: i64,
    listen: i64,
    track: i64,
    user: i64,
}

async fn set_db_values(pool: &Pool<MySql>) -> Result<(), ()> {
    let count = query_file_as!(TableCounts, "query/get-db-totals.sql")
        .fetch_one(pool)
        .await
        .map_err(|error| {
            tracing::error!("failed to generate db metric stats: {error}");
        })?;

    TOTAL_ACCOUNTS.set(count.account as f64);
    TOTAL_ALBUMS.set(count.album as f64);
    TOTAL_ARTISTS.set(count.artist as f64);
    TOTAL_LISTENS.set(count.listen as f64);
    TOTAL_TRACKS.set(count.track as f64);
    TOTAL_USERS.set(count.user as f64);
    Ok(())
}

#[axum::debug_handler]
#[instrument(name = "metrics", skip_all)]
pub async fn get_prometheus_metrics(
    State(state): State<AppState>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let _ = set_db_values(state.db).await;

    let mut buffer = Vec::new();
    let encoder = TextEncoder::new();
    let metric_families = prometheus::gather();

    encoder
        .encode(&metric_families, &mut buffer)
        .map_err(|err| {
            tracing::error!("failed to generate metrics for prometheus: {err}");
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                "failed to generate metrics".to_string(),
            )
        })?;

    Ok(([("Content-Type", encoder.format_type())], buffer).into_response())
}
