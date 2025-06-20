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
pub struct SignInOauth2PostRequest {
    /// The provider ID for the OAuth provider
    #[serde(rename = "providerId")]
    pub provider_id: String,
    /// The URL to redirect to after sign in
    #[serde(rename = "callbackURL", skip_serializing_if = "Option::is_none")]
    pub callback_url: Option<String>,
    /// The URL to redirect to if an error occurs
    #[serde(rename = "errorCallbackURL", skip_serializing_if = "Option::is_none")]
    pub error_callback_url: Option<String>,
    /// The URL to redirect to after login if the user is new
    #[serde(rename = "newUserCallbackURL", skip_serializing_if = "Option::is_none")]
    pub new_user_callback_url: Option<String>,
    /// Disable redirect
    #[serde(rename = "disableRedirect", skip_serializing_if = "Option::is_none")]
    pub disable_redirect: Option<String>,
    #[serde(rename = "scopes", skip_serializing_if = "Option::is_none")]
    pub scopes: Option<String>,
    /// Explicitly request sign-up. Useful when disableImplicitSignUp is true for this provider
    #[serde(rename = "requestSignUp", skip_serializing_if = "Option::is_none")]
    pub request_sign_up: Option<String>,
}

impl SignInOauth2PostRequest {
    pub fn new(provider_id: String) -> SignInOauth2PostRequest {
        SignInOauth2PostRequest {
            provider_id,
            callback_url: None,
            error_callback_url: None,
            new_user_callback_url: None,
            disable_redirect: None,
            scopes: None,
            request_sign_up: None,
        }
    }
}

