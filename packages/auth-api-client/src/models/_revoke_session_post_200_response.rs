/*
 * Better Auth
 *
 * API Reference for your Better Auth Instance
 *
 * The version of the OpenAPI document: 1.1.0
 * 
 * Generated by: https://openapi-generator.tech
 */

use crate::models;
use serde::{Deserialize, Serialize};

#[derive(Clone, Default, Debug, PartialEq, Serialize, Deserialize)]
pub struct RevokeSessionPost200Response {
    /// Indicates if the session was revoked successfully
    #[serde(rename = "status")]
    pub status: bool,
}

impl RevokeSessionPost200Response {
    pub fn new(status: bool) -> RevokeSessionPost200Response {
        RevokeSessionPost200Response {
            status,
        }
    }
}

