use axum::Json;
use axum::extract::{Path, Query, State};
use chrono::NaiveDateTime;
use reqwest::StatusCode;
use rspotify::Token;
use rspotify::model::{AdditionalType, PlayableItem};
use rspotify::prelude::OAuthClient;
use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use utoipa::{IntoParams, ToSchema};
use utoipa_axum::router::OpenApiRouter;
use utoipa_axum::routes;

use crate::AppState;
use crate::auth::AuthenticatedUser;
use crate::spotify::init_spotify_from_token;

pub fn router(state: AppState) -> OpenApiRouter {
    OpenApiRouter::new()
        .routes(routes!(user_profile))
        .routes(routes!(listen_hist))
        .routes(routes!(self_profile))
        .with_state(state)
}

#[derive(Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct Profile {
    top_tracks: Vec<TopTrack>,
    listen_stats: TotalListenStats,
    user: UserProfile,
    current_playing: CurrentlyPlaying,
}

#[derive(Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct SelfProfile {
    top_tracks: Vec<TopTrack>,
    listen_stats: TotalListenStats,
    user: UserProfile,
    current_playing: CurrentlyPlaying,
    overview: ProfileOverview,
    top_artists: Vec<TopArtists>,
}

#[derive(FromRow, Serialize, Clone, Debug, ToSchema)]
#[serde(rename_all = "camelCase")]
struct ProfileOverview {
    total_listening_hours: f64,
    unique_tracks: i64,
    total_plays: i64,
    weekly_average: f64,
}

#[derive(FromRow, Serialize, Clone, Debug, ToSchema)]
#[serde(rename_all = "camelCase")]
struct TotalListenStats {
    total_seconds: i64,
    unique_tracks_count: i64,
}

#[derive(FromRow, Serialize, Clone, Debug, ToSchema)]
#[serde(rename_all = "camelCase")]
struct TopArtists {
    artist_id: String,
    artist_name: String,
    listen_count: i64,
}

#[derive(FromRow, Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
struct TopTrack {
    track_id: String,
    track_name: String,
    duration: Option<i32>,
    album_name: Option<String>,
    album_art: Option<String>,
    artist_name: Option<String>,
    listen_count: i64,
}

#[derive(FromRow, Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
struct UserProfile {
    id: String,
    name: String,
    image: Option<String>,
}
#[derive(FromRow)]
struct SpotifyTokens {
    spotify_access_token: Option<String>,
    spotify_refresh_token: Option<String>,
    spotify_expires_at: Option<NaiveDateTime>,
}

#[derive(ToSchema, Serialize)]
#[serde(rename_all = "camelCase")]
struct PlayingTrack {
    track_id: String,
    track_name: String,
    duration: i64,
    album_name: String,
    album_art: Option<String>,
    artist_name: Option<String>,
}

#[derive(ToSchema, Serialize)]
#[serde(rename_all = "camelCase")]
struct CurrentlyPlaying {
    // #[serde(with = "ts_milliseconds")]
    // #[serde(with = "option_duration_ms", rename = "progress_ms")]
    pub progress: i64,
    pub is_playing: bool,
    pub track: Option<PlayingTrack>,
}

#[axum::debug_handler]
#[utoipa::path(
        get,
        tag = "default",
        path = "/profile/{id}",
        params(
            ("id" = String, Path, description = "id of user to get profile for")
        ),
        responses(
            (status = 200, description = "data for users public profile", body = Profile)
        )
    )]
pub async fn user_profile(
    State(state): State<AppState>,
    Path(user_id): Path<String>,
) -> Result<Json<Profile>, (StatusCode, String)> {
    let tokens = sqlx::query_file_as!(SpotifyTokens, "query/get-user-spotify-tokens.sql", user_id)
        .fetch_one(state.db)
        .await
        .map_err(|err| (StatusCode::INTERNAL_SERVER_ERROR, err.to_string()))?;

    let token = Token {
        access_token: tokens.spotify_access_token.expect("need token"),
        refresh_token: tokens.spotify_refresh_token,
        expires_at: tokens.spotify_expires_at.map(|date| date.and_utc()),
        ..Default::default()
    };

    let spotify = init_spotify_from_token(user_id.clone(), token);
    let additional_types = [AdditionalType::Track];
    let recent = spotify
        .current_playing(None, Some(&additional_types))
        .await
        .map_err(|err| (StatusCode::INTERNAL_SERVER_ERROR, err.to_string()))?;
    let is_playing = recent.clone().is_some_and(|recent| recent.is_playing);
    let progress = recent
        .clone()
        .map_or(0, |recent| recent.progress.map_or(0, |a| a.num_seconds()));

    let track = recent
        .and_then(|track| track.item)
        .and_then(|item| match item {
            PlayableItem::Track(track) => {
                let id = track.id;
                match id {
                    Some(id) => Some(PlayingTrack {
                        duration: track.duration.num_seconds(),
                        track_id: id.to_string(),
                        track_name: track.name,
                        album_art: track.album.images.first().map(|image| image.url.clone()),
                        album_name: track.album.name,
                        artist_name: track.artists.first().map(|artist| artist.name.clone()),
                    }),
                    None => None,
                }
            }
            PlayableItem::Episode(_) => None,
        });

    let current_playing = CurrentlyPlaying {
        track,
        is_playing,
        progress,
    };

    let profile = sqlx::query_file_as!(UserProfile, "query/get-profile.sql", user_id)
        .fetch_one(state.db)
        .await
        .map_err(|err| (StatusCode::INTERNAL_SERVER_ERROR, err.to_string()))?;

    let items = sqlx::query_file_as!(TopTrack, "query/get-top-tracks.sql", user_id)
        .fetch_all(state.db)
        .await
        .map_err(|err| (StatusCode::INTERNAL_SERVER_ERROR, err.to_string()))?;

    let total_listen_stats = sqlx::query_file_as!(
        TotalListenStats,
        "query/get-total-listen-minutes.sql",
        user_id
    )
    .fetch_one(state.db)
    .await
    .map_err(|err| (StatusCode::INTERNAL_SERVER_ERROR, err.to_string()))?;

    Ok(Json(Profile {
        current_playing,
        user: profile,
        top_tracks: items,
        listen_stats: total_listen_stats,
    }))
}

#[derive(FromRow, Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
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

#[derive(Deserialize, ToSchema, IntoParams)]
struct Pagination {
    cursor: Option<i64>,
}

#[derive(Deserialize, ToSchema, Serialize)]
struct CursorPaginated<CursorType, Data> {
    cursor: Option<CursorType>,
    data: Data,
}

#[axum::debug_handler]
#[utoipa::path(
        get,
        tag = "default",
        path = "/profile/{id}/history",
        params(
            ("id" = String, Path, description = "id of user to get profile for"),
            Pagination
        ),
        responses(
            (status = 200, description = "listening history for given user", body = CursorPaginated<i64, Vec<Listen>>)
        )
    )]
async fn listen_hist(
    State(state): State<AppState>,
    Path(user_id): Path<String>,
    Query(pagination): Query<Pagination>,
) -> Result<Json<CursorPaginated<i64, Vec<Listen>>>, (StatusCode, String)> {
    let mut items = sqlx::query_file_as!(
        Listen,
        "query/get-listening-history.sql",
        user_id,
        // I do not want to make another .sql file just to handle the default no cursor  case,
        // instead, use a high epoch default
        pagination.cursor.unwrap_or(9999999999999999),
        101
    )
    .fetch_all(state.db)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "error".to_string()))?;

    let next = items.pop();
    let cursor = next.map(|f| f.time);
    Ok(Json(CursorPaginated {
        cursor,
        data: items,
    }))
}

#[axum::debug_handler]
#[utoipa::path(
        get,
        tag = "default",
        path = "/profile/self",
        responses(
            (status = 200, description = "data for users profile, includes more data compared to public profile view", body = SelfProfile)
        )
    )]
pub async fn self_profile(
    State(state): State<AppState>,
    AuthenticatedUser(user): AuthenticatedUser,
) -> Result<Json<SelfProfile>, (StatusCode, String)> {
    let tokens = sqlx::query_file_as!(SpotifyTokens, "query/get-user-spotify-tokens.sql", user.id)
        .fetch_one(state.db)
        .await
        .map_err(|err| (StatusCode::INTERNAL_SERVER_ERROR, err.to_string()))?;

    let token = Token {
        access_token: tokens.spotify_access_token.expect("need token"),
        refresh_token: tokens.spotify_refresh_token,
        expires_at: tokens.spotify_expires_at.map(|date| date.and_utc()),
        ..Default::default()
    };

    let spotify = init_spotify_from_token(user.id.clone(), token);
    let additional_types = [AdditionalType::Track];
    let recent = spotify
        .current_playing(None, Some(&additional_types))
        .await
        .map_err(|err| (StatusCode::INTERNAL_SERVER_ERROR, err.to_string()))?;
    let is_playing = recent.clone().is_some_and(|recent| recent.is_playing);
    let progress = recent
        .clone()
        .map_or(0, |recent| recent.progress.map_or(0, |a| a.num_seconds()));

    let track = recent
        .and_then(|track| track.item)
        .and_then(|item| match item {
            PlayableItem::Track(track) => {
                let id = track.id;
                match id {
                    Some(id) => Some(PlayingTrack {
                        duration: track.duration.num_seconds(),
                        track_id: id.to_string(),
                        track_name: track.name,
                        album_art: track.album.images.first().map(|image| image.url.clone()),
                        album_name: track.album.name,
                        artist_name: track.artists.first().map(|artist| artist.name.clone()),
                    }),
                    None => None,
                }
            }
            PlayableItem::Episode(_) => None,
        });

    let current_playing = CurrentlyPlaying {
        track,
        is_playing,
        progress,
    };

    let profile = sqlx::query_file_as!(UserProfile, "query/get-profile.sql", user.id)
        .fetch_one(state.db)
        .await
        .map_err(|err| (StatusCode::INTERNAL_SERVER_ERROR, err.to_string()))?;

    let items = sqlx::query_file_as!(TopTrack, "query/get-top-tracks.sql", user.id)
        .fetch_all(state.db)
        .await
        .map_err(|err| (StatusCode::INTERNAL_SERVER_ERROR, err.to_string()))?;

    let total_listen_stats = sqlx::query_file_as!(
        TotalListenStats,
        "query/get-total-listen-minutes.sql",
        user.id
    )
    .fetch_one(state.db)
    .await
    .map_err(|err| (StatusCode::INTERNAL_SERVER_ERROR, err.to_string()))?;

    let overview = sqlx::query_file_as!(ProfileOverview, "query/profile-overview.sql", user.id)
        .fetch_one(state.db)
        .await
        .map_err(|err| (StatusCode::INTERNAL_SERVER_ERROR, err.to_string()))?;

    let top_artists = sqlx::query_file_as!(TopArtists, "query/get-top-artists.sql", user.id)
        .fetch_all(state.db)
        .await
        .map_err(|err| (StatusCode::INTERNAL_SERVER_ERROR, err.to_string()))?;

    Ok(Json(SelfProfile {
        current_playing,
        user: profile,
        top_tracks: items,
        listen_stats: total_listen_stats,
        overview,
        top_artists,
    }))
}
