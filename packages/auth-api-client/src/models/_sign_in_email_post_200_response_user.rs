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
pub struct SignInEmailPost200ResponseUser {
    #[serde(rename = "id")]
    pub id: String,
    #[serde(rename = "email")]
    pub email: String,
    #[serde(rename = "name", skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(rename = "image", skip_serializing_if = "Option::is_none")]
    pub image: Option<String>,
    #[serde(rename = "emailVerified")]
    pub email_verified: bool,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "updatedAt")]
    pub updated_at: String,
}

impl SignInEmailPost200ResponseUser {
    pub fn new(id: String, email: String, email_verified: bool, created_at: String, updated_at: String) -> SignInEmailPost200ResponseUser {
        SignInEmailPost200ResponseUser {
            id,
            email,
            name: None,
            image: None,
            email_verified,
            created_at,
            updated_at,
        }
    }
}

