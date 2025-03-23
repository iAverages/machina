pub mod profile;

use utoipa_axum::router::OpenApiRouter;

use crate::AppState;

pub fn router(state: AppState) -> OpenApiRouter {
    OpenApiRouter::new().merge(profile::router(state))
}
