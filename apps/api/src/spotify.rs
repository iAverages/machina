use std::env;
use std::sync::Arc;

use rspotify::{
    scopes, AuthCodeSpotify, CallbackError, Config, Credentials, OAuth, Token, TokenCallback,
};
use sqlx::Error;
use tokio::runtime::{Handle, Runtime};
use tokio::task::{self, spawn_blocking};

use crate::GLOBAL_DB_POOL;

pub fn init_spotify() -> AuthCodeSpotify {
    let config = get_spotify_config(None);
    let oauth = get_spotify_oauth_config();

    let client_id = env::var("client_id").expect("no client_id found");
    let client_secret = env::var("client_secret").expect("no client_secret found");

    let creds = Credentials::new(&client_id, &client_secret);
    AuthCodeSpotify::with_config(creds, oauth, config)
}

pub fn init_spotify_from_token(user_id: String, token: Token) -> AuthCodeSpotify {
    let config = get_spotify_config(Some(user_id));
    let oauth = get_spotify_oauth_config();

    let client_id = env::var("client_id").expect("no client_id found");
    let client_secret = env::var("client_secret").expect("no client_secret found");

    let creds = Credentials::new(&client_id, &client_secret);
    AuthCodeSpotify::from_token_with_config(token, creds, oauth, config)
}

pub fn store_refresh_token(user_id: String, token: Token) -> Result<(), CallbackError> {
    task::block_in_place(|| {
        tokio::runtime::Handle::current().block_on(async move {
            let lock = GLOBAL_DB_POOL.lock().await;
            let db = lock.as_deref().unwrap();

            let access_token = token.access_token;
            let refresh_token = token.refresh_token;
            let expires_at = token.expires_at;
            let _ = sqlx::query_file!(
                "query/update-spotify-token.sql",
                access_token,
                refresh_token,
                expires_at,
                user_id
            )
            .execute(db)
            .await?;

            Ok::<(), Error>(())
        })
    })
    .map_err(|_| {
        // TODO: handle this better?
        CallbackError::CustomizedError("Failed to update tokens in database".to_string())
    })?;

    Ok(())
}

pub fn get_spotify_config(user_id: Option<String>) -> Config {
    Config {
        token_callback_fn: Arc::new(Some(TokenCallback(Box::new(move |token| {
            if let Some(id) = &user_id {
                tracing::info!(user_id = id, "updating spotify token");
                store_refresh_token(id.clone(), token)?;
            }

            Ok(())
        })))),
        ..Default::default()
    }
}

pub fn get_spotify_oauth_config() -> OAuth {
    OAuth {
        redirect_uri: "http://localhost:3001/oauth/spotify/callback".to_string(),
        scopes: scopes!(
            "user-read-recently-played",
            "user-read-playback-state",
            "user-read-currently-playing"
        ),
        ..Default::default()
    }
}
