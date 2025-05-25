use axum::{
    Extension,
    extract::{FromRequestParts, Request},
    http::{StatusCode, request::Parts},
    middleware::Next,
    response::Response,
};
use axum_extra::extract::CookieJar;

#[derive(Debug, Clone)]
pub struct User {
    pub id: String,
}

pub async fn get_user_from_session_id(token: &str) -> Option<User> {
    // TODO: fetch actual user
    Some(User {
        id: "fp0sllluqyvm69f5ukrc6buv".to_string(),
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
    let user = if let Some(session_cookie) = jar.get("machina.session_token") {
        get_user_from_session_id(session_cookie.value()).await
    } else {
        None
    };

    request.extensions_mut().insert(OptionalUser(user));

    next.run(request).await
}
