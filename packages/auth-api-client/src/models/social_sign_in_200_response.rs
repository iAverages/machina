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

/// SocialSignIn200Response : Session response when idToken is provided
#[derive(Clone, Default, Debug, PartialEq, Serialize, Deserialize)]
pub struct SocialSignIn200Response {
    #[serde(rename = "redirect", skip_serializing_if = "Option::is_none")]
    pub redirect: Option<Redirect>,
    /// Session token
    #[serde(rename = "token", skip_serializing_if = "Option::is_none")]
    pub token: Option<String>,
}

impl SocialSignIn200Response {
    /// Session response when idToken is provided
    pub fn new() -> SocialSignIn200Response {
        SocialSignIn200Response {
            redirect: None,
            token: None,
        }
    }
}
/// 
#[derive(Clone, Copy, Debug, Eq, PartialEq, Ord, PartialOrd, Hash, Serialize, Deserialize)]
pub enum Redirect {
    #[serde(rename = "false")]
    False,
}

impl Default for Redirect {
    fn default() -> Redirect {
        Self::False
    }
}

