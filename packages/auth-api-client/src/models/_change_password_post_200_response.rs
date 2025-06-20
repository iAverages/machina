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
pub struct ChangePasswordPost200Response {
    /// New session token if other sessions were revoked
    #[serde(rename = "token", skip_serializing_if = "Option::is_none")]
    pub token: Option<String>,
    #[serde(rename = "user")]
    pub user: Box<models::SignUpEmailPost200ResponseUser>,
}

impl ChangePasswordPost200Response {
    pub fn new(user: models::SignUpEmailPost200ResponseUser) -> ChangePasswordPost200Response {
        ChangePasswordPost200Response {
            token: None,
            user: Box::new(user),
        }
    }
}

