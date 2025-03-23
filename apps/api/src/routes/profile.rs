use axum::Json;
use axum::extract::{Path, State};
use axum::response::IntoResponse;
use reqwest::StatusCode;
use serde::Serialize;
use sqlx::prelude::FromRow;

use crate::AppState;

#[derive(Serialize)]
struct Profile {
    top_tracks: Vec<TopTrack>,
    listen_stats: TotalListenStats,
    user: UserProfile,
}

#[derive(FromRow, Serialize, Clone, Debug)]
struct TotalListenStats {
    total_seconds: i64,
    unique_tracks_count: i64,
}

#[derive(FromRow, Serialize)]
struct TopTrack {
    track_id: Option<String>,
    track_name: Option<String>,
    duration: Option<i32>,
    album_name: Option<String>,
    album_art: Option<String>,
    artist_name: Option<String>,
    listen_count: i64,
}

#[derive(FromRow, Serialize)]
struct UserProfile {
    id: String,
    name: String,
    image: Option<String>,
}

#[axum::debug_handler]
pub async fn user_profile(
    State(state): State<AppState>,
    Path(user_id): Path<String>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let profile = sqlx::query_file_as!(UserProfile, "query/get-profile.sql", user_id)
        .fetch_one(state.db)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "error".to_string()))?;

    let items = sqlx::query_file_as!(TopTrack, "query/get-top-tracks.sql", user_id)
        .fetch_all(state.db)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "error".to_string()))?;

    let total_listen_stats = sqlx::query_file_as!(
        TotalListenStats,
        "query/get-total-listen-minutes.sql",
        user_id
    )
    .fetch_one(state.db)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "error".to_string()))?;

    Ok(Json(Profile {
        user: profile,
        top_tracks: items,
        listen_stats: total_listen_stats,
    }))
}
