use std::env;

use rspotify::{scopes, AuthCodeSpotify, Config, Credentials, OAuth, Token};

pub fn init_spotify() -> AuthCodeSpotify {
    let config = get_spotify_config();
    let oauth = get_spotify_oauth_config();

    let client_id = env::var("client_id").expect("no client_id found");
    let client_secret = env::var("client_secret").expect("no client_secret found");

    let creds = Credentials::new(&client_id, &client_secret);
    AuthCodeSpotify::with_config(creds, oauth, config)
}

pub fn init_spotify_from_token(token: Token) -> AuthCodeSpotify {
    let config = get_spotify_config();
    let oauth = get_spotify_oauth_config();

    let client_id = env::var("client_id").expect("no client_id found");
    let client_secret = env::var("client_secret").expect("no client_secret found");

    let creds = Credentials::new(&client_id, &client_secret);
    AuthCodeSpotify::from_token_with_config(token, creds, oauth, config)
}

pub fn get_spotify_config() -> Config {
    Config {
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
