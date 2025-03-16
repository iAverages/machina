use chrono::NaiveDateTime;
use sqlx::prelude::FromRow;

pub struct Test {
    pub id: i32,
    pub name: String,
}

#[derive(FromRow, Debug)]
pub struct User {
    pub id: String,
    pub name: String,
    pub spotify_id: String,
    pub spotify_access_token: String,
    pub spotify_refresh_token: Option<String>,
    pub spotify_expires_at: Option<NaiveDateTime>,
}

pub struct Track {
    pub id: String,
    pub name: String,
}

pub struct Listen {
    pub id: i64,
    pub track_id: String,
}
