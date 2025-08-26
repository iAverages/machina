use std::vec;

use async_nats::jetstream::object_store::List;
use axum::Json;
use axum::extract::{Path, State};
use chrono::{DateTime, Utc};
use reqwest::StatusCode;
use rspotify::model::{TrackId, track};
use sea_query::{Alias, Expr, InsertStatement, MysqlQueryBuilder, OnConflict, Query};
use sea_query_binder::SqlxBinder;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use utoipa_axum::router::OpenApiRouter;
use utoipa_axum::routes;

use crate::AppState;
use crate::auth::AuthenticatedUser;
use crate::database::tables::tracks::{Listen, Track};

pub fn router(state: AppState) -> OpenApiRouter {
    OpenApiRouter::new()
        .routes(routes!(ingest_listens))
        .with_state(state)
}

const LISTEN_INSERT_COLS: [Listen; 3] = [Listen::Id, Listen::TrackId, Listen::UserId];

fn build_listens_insert_query(
    listens: Vec<IngestListen>,
    user_id: String,
) -> (InsertStatement, Vec<String>, Vec<IngestListen>) {
    let mut stmt = Query::insert();
    stmt.into_table(Listen::Table).columns(LISTEN_INSERT_COLS);

    let mut invalid_listens = vec![];
    let mut track_ids = vec![];
    for listen in listens.into_iter() {
        let date = listen.ts.parse::<DateTime<Utc>>();
        if date.is_err() {
            invalid_listens.push(listen);
            continue;
        }
        let track_id = listen.spotify_track_uri.clone();
        let timestamp = date.unwrap().timestamp() * 1000; // get MS for storage
        if stmt
            .values([
                timestamp.into(),
                listen.spotify_track_uri.clone().into(),
                user_id.clone().into(),
            ])
            .is_err()
        {
            invalid_listens.push(listen);
        }

        track_ids.push(track_id);
    }

    stmt.on_conflict(
        OnConflict::columns([Listen::Id, Listen::UserId])
            .update_column(Listen::Id)
            .to_owned(),
    );

    (stmt, track_ids, invalid_listens)
}
fn build_track_insert_query(track_ids: Vec<String>) -> InsertStatement {
    let mut stmt = Query::insert();
    stmt.into_table(Track::Table).columns([Track::Id]);

    for track_id in track_ids.into_iter() {
        if let Err(error) = stmt.values([track_id.clone().into()]) {
            tracing::error!(
                track_id,
                error = error.to_string(),
                "failed to add track id to query"
            );
        };
    }

    stmt.on_conflict(
        OnConflict::column(Track::Id)
            .update_column(Track::Id)
            .to_owned(),
    );

    stmt
}

#[derive(ToSchema, Deserialize, Debug, Serialize, Clone)]
pub struct IngestListen {
    pub ts: String,
    pub spotify_track_uri: String,
}

#[axum::debug_handler]
#[utoipa::path(
        post,
        tag = "default",
        path = "/ingest/spotify",
        responses(
            (status = 200, description = "listen data to ingest", body = Vec<IngestListen>)
        )
    )]
pub async fn ingest_listens(
    State(state): State<AppState>,
    AuthenticatedUser(user): AuthenticatedUser,
    Json(listens): Json<Vec<IngestListen>>,
) -> Result<Json<IngestResult>, (StatusCode, String)> {
    let mut stats = IngestResult {
        total_successful: 0,
        total_failed: 0,
        failed: vec![],
    };

    for listen_chunk in listens.chunks(u16::MAX as usize / LISTEN_INSERT_COLS.len()) {
        let (listens_stmt, track_ids, mut invalid_listens) =
            build_listens_insert_query(listen_chunk.to_vec(), user.id.clone());
        let track_stmt = build_track_insert_query(track_ids);

        let (sql, values) = track_stmt.build_sqlx(MysqlQueryBuilder);
        let res = sqlx::query_with(&sql, values)
            .execute(state.db)
            .await
            .expect("failed to ingest listens");
        tracing::info!(
            amount = res.rows_affected(),
            "inserted tracks into database",
        );

        let (sql, values) = listens_stmt.build_sqlx(MysqlQueryBuilder);
        let res = sqlx::query_with(&sql, values)
            .execute(state.db)
            .await
            .expect("failed to ingest listens");

        tracing::info!(
            amount = res.rows_affected(),
            "inserted listens into database"
        );
        stats.total_successful += res.rows_affected();
        stats.total_failed += invalid_listens.len() as u64;
        stats.failed.append(&mut invalid_listens);
    }

    Ok(Json(stats))
}

#[derive(Serialize)]
pub struct IngestResult {
    pub total_successful: u64,
    pub total_failed: u64,
    pub failed: Vec<IngestListen>,
}
