mod config;
mod models;
mod openapi;
mod preview;
mod routes;
mod spotify;
mod spotify_embed;
mod sync;

use reqwest::Method;
use sqlx::mysql::MySqlPoolOptions;
use sqlx::{MySql, Pool};
use std::collections::HashMap;
use std::env;
use std::sync::Arc;
use tokio::sync::{Mutex, Notify};
use tower_http::cors::CorsLayer;
use utoipa::OpenApi;
use utoipa::openapi::LicenseBuilder;
use utoipa_axum::router::OpenApiRouter;
use utoipa_scalar::{Scalar, Servable as ScalarServable};

use axum::http::HeaderValue;
use axum::routing::get;
use axum::{Json, Router};

use once_cell::sync::Lazy;

use self::config::{MachinaConfig, get_config};
use self::preview::root;
use self::sync::start_sync_loop;

#[derive(Clone)]
struct AppState {
    generation_tasks: Arc<Mutex<HashMap<String, Arc<Notify>>>>,
    db: &'static Pool<MySql>,
}

#[derive(OpenApi)]
#[openapi(
        tags(
            (name = "default", description = "default api")
        )
    )]
pub struct ApiDoc;

static GLOBAL_DB_POOL: Lazy<Arc<Mutex<Option<&'static Pool<MySql>>>>> =
    Lazy::new(|| Arc::new(Mutex::new(None)));

static MACHINA_CONFIG: Lazy<MachinaConfig> = Lazy::new(|| get_config().expect("config"));

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .compact()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| {
                format!("{}=debug,axum::rejection=trace", env!("CARGO_CRATE_NAME")).into()
            }),
        )
        .init();

    let pool = MySqlPoolOptions::new()
        .max_connections(5)
        .connect(&MACHINA_CONFIG.database_url)
        .await
        .expect("failed to connect to database");

    let static_pool: &'static Pool<MySql> = Box::leak(Box::new(pool));

    let state = AppState {
        generation_tasks: Arc::new(Mutex::new(HashMap::new())),
        db: static_pool,
    };

    {
        let mut db_pool = GLOBAL_DB_POOL.lock().await;
        *db_pool = Some(static_pool);
    }

    let base_router = routes::router(state.clone());

    let mut doc = ApiDoc::openapi();
    doc.info.license = Some(
        LicenseBuilder::new()
            .name("MIT")
            .identifier(Some("MIT"))
            .build(),
    );

    let cors = CorsLayer::new()
        .allow_methods([Method::GET, Method::POST])
        .allow_origin(
            MACHINA_CONFIG
                .app_url
                .trim_end_matches('/')
                .parse::<HeaderValue>()
                .unwrap(),
        );

    let (openapi_router, api) = OpenApiRouter::with_openapi(ApiDoc::openapi())
        .nest("/api", base_router)
        .split_for_parts();

    let app = Router::new()
        .route("/{trackId}", get(root))
        .route("/openapi.json", get(Json(api.clone())))
        .with_state(state.clone());

    let openapi_router = openapi_router
        .merge(app)
        .merge(Scalar::with_url("/scalar", api))
        .layer(cors);

    start_sync_loop(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001").await.unwrap();
    tracing::info!("listening on :3001");
    axum::serve(listener, openapi_router.into_make_service())
        .await
        .unwrap();
}
