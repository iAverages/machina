pub mod listens;
pub mod profile;

use utoipa_axum::router::OpenApiRouter;

use crate::AppState;

use self::listens::import;

pub fn router(state: AppState) -> OpenApiRouter {
    OpenApiRouter::new()
        .merge(profile::router(state.clone()))
        .merge(import::router(state))
}
