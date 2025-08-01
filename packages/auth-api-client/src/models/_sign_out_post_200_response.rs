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
pub struct SignOutPost200Response {
    #[serde(rename = "success", skip_serializing_if = "Option::is_none")]
    pub success: Option<bool>,
}

impl SignOutPost200Response {
    pub fn new() -> SignOutPost200Response {
        SignOutPost200Response {
            success: None,
        }
    }
}

