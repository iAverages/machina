use chrono::NaiveDateTime;
use sqlx::prelude::FromRow;

#[derive(FromRow, Debug)]
pub struct ListenSyncUser {
    pub id: String,
    pub spotify_access_token: Option<String>,
    pub spotify_refresh_token: Option<String>,
    pub spotify_expires_at: Option<NaiveDateTime>,
}
