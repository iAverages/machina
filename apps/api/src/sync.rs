use anyhow::Result;
use chrono::NaiveDateTime;
use rspotify::Token;
use rspotify::model::{PlayHistory, SimplifiedAlbum, SimplifiedArtist};
use rspotify::prelude::OAuthClient;
use sqlx::prelude::FromRow;
use sqlx::{MySql, QueryBuilder};
use std::collections::HashSet;
use tokio::task;
use tokio::time::{Duration, sleep};
use tracing::instrument;

use crate::AppState;
use crate::spotify::init_spotify_from_token;

#[derive(FromRow, Debug)]
pub struct ListenSyncUser {
    pub id: String,
    pub spotify_access_token: Option<String>,
    pub spotify_refresh_token: Option<String>,
    pub spotify_expires_at: Option<NaiveDateTime>,
}

pub fn start_sync_loop(state: AppState) {
    task::spawn(async move {
        loop {
            let res = sync_loop(state.clone()).await;
            match res {
                Ok(_) => tracing::info!("sync completed successfully"),
                Err(err) => tracing::error!("sync loop error {:?}", err),
            }
            sleep(Duration::from_secs(60)).await;
        }
    });
}

#[instrument(skip_all)]
pub async fn sync_loop(state: AppState) -> Result<()> {
    tracing::info!("updating listening history");
    let users = sqlx::query_file_as!(ListenSyncUser, "query/get-users.sql")
        .fetch_all(state.db)
        .await?;

    for user in users {
        let _ = import_user_listens(state.clone(), user).await;
    }

    Ok(())
}

#[instrument(skip_all, fields(self.user_id = %user.id))]
async fn import_user_listens(state: AppState, user: ListenSyncUser) -> Result<()> {
    tracing::info!("fetching history");
    let token = Token {
        access_token: user.spotify_access_token.expect("need token"),
        refresh_token: user.spotify_refresh_token,
        expires_at: user.spotify_expires_at.map(|date| date.and_utc()),
        ..Default::default()
    };

    let spotify = init_spotify_from_token(user.id.clone(), token);
    let recent = spotify.current_user_recently_played(Some(50), None).await?;

    let listens = recent
        .items
        .iter()
        .filter(|listen| listen.track.id.is_some())
        .collect::<Vec<&PlayHistory>>();

    let mut seen_albums = HashSet::new();
    let albums = listens
        .iter()
        .filter_map(|listen| {
            let album = &listen.track.album;

            if let Some(id) = &album.id {
                if seen_albums.insert(id.clone()) {
                    Some(album)
                } else {
                    None
                }
            } else {
                None
            }
        })
        .collect::<Vec<&SimplifiedAlbum>>();

    let mut seen_artists = HashSet::new();
    let artists = listens
        .iter()
        .filter_map(|listen| {
            let artist = listen.track.artists.first().unwrap();

            if let Some(id) = &artist.id {
                if seen_artists.insert(id.clone()) {
                    Some(artist)
                } else {
                    None
                }
            } else {
                None
            }
        })
        .collect::<Vec<&SimplifiedArtist>>();

    tracing::info!(
        "found {} listens, {} albums, {} artists",
        listens.len(),
        albums.len(),
        artists.len(),
    );

    if !artists.is_empty() {
        let mut qb: QueryBuilder<MySql> = QueryBuilder::new("INSERT IGNORE INTO artist (id, name)");

        qb.push_values(artists, |mut b, artist| {
            let id = artist.id.as_ref().unwrap().to_string();
            let name = &artist.name;
            b.push_bind(id).push_bind(name);
        });
        qb.push(" ON DUPLICATE KEY UPDATE ")
            .push("name = VALUES(name)");
        qb.build().execute(state.db).await?;
    }

    if !albums.is_empty() {
        let mut qb: QueryBuilder<MySql> =
            QueryBuilder::new("INSERT IGNORE INTO album (id, name, cover_art)");

        qb.push_values(albums, |mut b, album| {
            let id = album.id.as_ref().unwrap().to_string();
            let name = &album.name;
            let image = &album.images.first().unwrap().url;
            b.push_bind(id).push_bind(name).push_bind(image);
        });
        qb.push(" ON DUPLICATE KEY UPDATE ")
            .push("name = VALUES(name), ")
            .push("cover_art = VALUES(cover_art)");
        qb.build().execute(state.db).await?;
    }

    if !listens.is_empty() {
        let mut qb: QueryBuilder<MySql> = QueryBuilder::new(
            "INSERT IGNORE INTO track (id, name, album_id, artist_id, duration, explicit)",
        );
        qb.push_values(listens.iter(), |mut b, listen| {
            let track_name = &listen.track.name;
            let track_id = listen.track.id.as_ref().unwrap();
            let album_id = listen.track.album.id.as_ref().unwrap();
            let artist_id = listen.track.artists.first().unwrap().id.as_ref().unwrap();
            let duration = listen.track.duration.num_seconds();
            let explicit = listen.track.explicit;

            b.push_bind(track_id.to_string())
                .push_bind(track_name)
                .push_bind(album_id.to_string())
                .push_bind(artist_id.to_string())
                .push_bind(duration)
                .push_bind(explicit);
        });

        qb.push(" ON DUPLICATE KEY UPDATE ")
            .push("name = VALUES(name), ")
            .push("album_id = VALUES(album_id), ")
            .push("artist_id = VALUES(artist_id), ")
            .push("duration = VALUES(duration), ")
            .push("explicit = VALUES(explicit)");

        qb.build().execute(state.db).await?;

        let mut qb: QueryBuilder<MySql> =
            QueryBuilder::new("INSERT IGNORE INTO listen (id, track_id, user_id)");
        qb.push_values(listens, |mut b, listen| {
            let time = listen.played_at.timestamp_micros();
            let track_id = listen.track.id.as_ref().unwrap().to_string();
            b.push_bind(time).push_bind(track_id).push_bind(&user.id);
        });

        qb.build().execute(state.db).await?;
    }

    Ok(())
}
