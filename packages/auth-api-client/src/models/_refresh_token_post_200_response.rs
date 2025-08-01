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
pub struct RefreshTokenPost200Response {
    #[serde(rename = "tokenType", skip_serializing_if = "Option::is_none")]
    pub token_type: Option<String>,
    #[serde(rename = "idToken", skip_serializing_if = "Option::is_none")]
    pub id_token: Option<String>,
    #[serde(rename = "accessToken", skip_serializing_if = "Option::is_none")]
    pub access_token: Option<String>,
    #[serde(rename = "refreshToken", skip_serializing_if = "Option::is_none")]
    pub refresh_token: Option<String>,
    #[serde(rename = "accessTokenExpiresAt", skip_serializing_if = "Option::is_none")]
    pub access_token_expires_at: Option<String>,
    #[serde(rename = "refreshTokenExpiresAt", skip_serializing_if = "Option::is_none")]
    pub refresh_token_expires_at: Option<String>,
}

impl RefreshTokenPost200Response {
    pub fn new() -> RefreshTokenPost200Response {
        RefreshTokenPost200Response {
            token_type: None,
            id_token: None,
            access_token: None,
            refresh_token: None,
            access_token_expires_at: None,
            refresh_token_expires_at: None,
        }
    }
}

