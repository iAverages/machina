use std::{fmt::format, sync::Arc};

use axum::{
    extract::{FromRequestParts, Request},
    http::{StatusCode, request::Parts},
    middleware::Next,
    response::Response,
};
use axum_extra::extract::CookieJar;
use reqwest::{Client, Url, cookie::Jar};

use auth_api_client::apis::{configuration::Configuration, default_api::get_session_get};

use crate::MACHINA_CONFIG;

static AUTH_COOKE_NAME: &str = "machina.session_token";
static AUTH_COOKE_NAME_SECURE: &str = "__Secure-machina.session_token";

fn is_dev() -> bool {
    !MACHINA_CONFIG.app_url.starts_with("https")
}

// cannot set the cookie in the generated code, the apiKey prop is never used
fn get_authed_client(token: &str) -> Option<Client> {
    let jar = Arc::new(Jar::default());
    let url = Url::parse(&MACHINA_CONFIG.app_url)
        .inspect_err(|err| {
            tracing::error!("parsing url for auth server: {}", err);
        })
        .ok()?;

    if is_dev() {
        jar.add_cookie_str(format!("{AUTH_COOKE_NAME}={}", token).as_str(), &url);
    } else {
        jar.add_cookie_str(format!("{AUTH_COOKE_NAME_SECURE}={}", token).as_str(), &url);
    }

    reqwest::Client::builder()
        .cookie_provider(jar)
        .build()
        .inspect_err(|err| {
            tracing::error!("error occured while calling auth server: {}", err);
        })
        .ok()
}

#[derive(Debug, Clone)]
pub struct User {
    pub id: String,
}

pub async fn get_user_from_session_id(token: &str) -> Option<User> {
    tracing::info!("getting user : {}", token);
    let res = get_session_get(&Configuration {
        client: get_authed_client(token)?,
        base_path: format!(
            "{}/api/auth",
            &MACHINA_CONFIG
                .app_url
                .strip_suffix("/")
                .unwrap_or(&MACHINA_CONFIG.app_url)
        ),
        ..Default::default()
    })
    .await
    .inspect_err(|err| {
        tracing::error!("error while getting auth state for user: {}", err);
    })
    .ok()?;

    Some(User {
        id: res.user.id.unwrap(),
    })
}

#[derive(Debug, Clone)]
pub struct OptionalUser(pub Option<User>);
#[derive(Debug, Clone)]
pub struct AuthenticatedUser(pub User);

impl<S> FromRequestParts<S> for OptionalUser
where
    S: Send + Sync,
{
    type Rejection = StatusCode;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        parts
            .extensions
            .get::<OptionalUser>()
            .cloned()
            .ok_or(StatusCode::INTERNAL_SERVER_ERROR)
    }
}

impl<S> FromRequestParts<S> for AuthenticatedUser
where
    S: Send + Sync,
{
    type Rejection = StatusCode;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        let OptionalUser(user) = parts
            .extensions
            .get::<OptionalUser>()
            .cloned()
            .ok_or(StatusCode::INTERNAL_SERVER_ERROR)?;

        match user {
            Some(user) => Ok(AuthenticatedUser(user)),
            None => Err(StatusCode::UNAUTHORIZED),
        }
    }
}

pub async fn session_middleware(jar: CookieJar, mut request: Request, next: Next) -> Response {
    let token = jar
        .get(AUTH_COOKE_NAME_SECURE)
        .inspect(|value| tracing::debug!("secure session cookie: {value}"))
        .or_else(|| jar.get(AUTH_COOKE_NAME));

    let user = if let Some(session_cookie) = token {
        get_user_from_session_id(session_cookie.value()).await
    } else {
        None
    };

    request.extensions_mut().insert(OptionalUser(user));

    next.run(request).await
}
