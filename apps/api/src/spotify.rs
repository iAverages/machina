use std::sync::Arc;

use rspotify::{AuthCodeSpotify, CallbackError, Config, Credentials, OAuth, Token, TokenCallback};
use sqlx::Error;
use tokio::task;

use crate::{GLOBAL_DB_POOL, MACHINA_CONFIG};

pub fn init_spotify_from_token(user_id: String, token: Token) -> AuthCodeSpotify {
    let config = get_spotify_config(Some(user_id));
    let oauth = get_spotify_oauth_config();

    let creds = Credentials::new(
        &MACHINA_CONFIG.spotify_client_id,
        &MACHINA_CONFIG.spotify_client_secret,
    );
    AuthCodeSpotify::from_token_with_config(token, creds, oauth, config)
}

pub fn store_refresh_token(user_id: &str, token: Token) -> Result<(), CallbackError> {
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
    .map_err(|err| {
        tracing::error!(
            "Failed to update tokens in database for user {}: {}",
            user_id,
            err
        );
        CallbackError::CustomizedError("Failed to update tokens in database".to_string())
    })?;

    Ok(())
}

pub fn get_spotify_config(user_id: Option<String>) -> Config {
    Config {
        token_callback_fn: Arc::new(Some(TokenCallback(Box::new(move |token| {
            if let Some(id) = &user_id {
                tracing::info!(user_id = id, "updating spotify token");
                store_refresh_token(id.as_str(), token)?;
            }

            Ok(())
        })))),
        ..Default::default()
    }
}

pub fn get_spotify_oauth_config() -> OAuth {
    OAuth {
        ..Default::default()
    }
}
