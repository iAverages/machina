// just experimenting with spotify listening history sync

use anyhow::Result;
use rspotify::model::PlayHistory;
use rspotify::prelude::OAuthClient;
use rspotify::Token;
use sqlx::{MySql, QueryBuilder};
use tokio::time::{sleep, Duration};
use tracing::info_span;

use crate::models::User;
use crate::spotify::init_spotify_from_token;
use crate::AppState;

pub async fn sync_loop(state: AppState) -> Result<()> {
    loop {
        tracing::info!("updating listening history");
        let users = sqlx::query_file_as!(User, "query/get-users.sql")
            .fetch_all(&state.db)
            .await?;

        for user in users {
            tracing::info!("fetching history for {}", user.id);
            let token = Token {
                access_token: user.spotify_access_token,
                refresh_token: user.spotify_refresh_token,
                expires_at: user.spotify_expires_at.map(|date| date.and_utc()),
                ..Default::default()
            };
            let spotify = init_spotify_from_token(token);
            let recent = spotify.current_user_recently_played(Some(50), None).await?;
            let listens = recent
                .items
                .iter()
                .filter(|listen| listen.track.id.is_some())
                .collect::<Vec<&PlayHistory>>();

            tracing::info!("found {} listens", listens.len());

            let mut qb: QueryBuilder<MySql> =
                QueryBuilder::new("INSERT IGNORE INTO track (id, name)");
            qb.push_values(listens.iter(), |mut b, listen| {
                let track_name = &listen.track.name;
                let track_id = listen.track.id.as_ref().unwrap();
                b.push_bind(track_id.to_string()).push_bind(track_name);
            });

            let returned = qb.build().execute(&state.db).await?;
            println!("returned : {:?}", returned);

            let mut qb: QueryBuilder<MySql> =
                QueryBuilder::new("INSERT IGNORE INTO listen (id, track_id)");
            qb.push_values(listens, |mut b, listen| {
                let time = listen.played_at.timestamp_micros();
                let track_id = listen.track.id.as_ref().unwrap().to_string();
                b.push_bind(time).push_bind(track_id);
            });

            qb.build().execute(&state.db).await?;
        }

        sleep(Duration::from_secs(120)).await;
    }
}
