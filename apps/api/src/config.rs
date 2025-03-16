use dotenvy::dotenv;
use envconfig::Envconfig;

#[derive(Debug, Envconfig, Clone)]
pub struct MachinaConfig {
    #[envconfig(from = "APP_URL")]
    pub app_url: String,
    #[envconfig(from = "API_URL")]
    pub api_url: String,
    #[envconfig(from = "DATABASE_URL")]
    pub database_url: String,
    #[envconfig(from = "SPOTIFY_CLIENT_ID")]
    pub spotify_client_id: String,
    #[envconfig(from = "SPOTIFY_CLIENT_SECRET")]
    pub spotify_client_secret: String,
}

#[derive(Debug, thiserror::Error)]
pub enum MachinaConfigError {
    #[error("missing required environment variable: {0}")]
    MissingRequired(&'static str),

    #[error("failed to parse environment variable: {0}")]
    ParseError(&'static str),
}

pub fn get_config() -> Result<MachinaConfig, MachinaConfigError> {
    dotenv().ok();

    // TODO: add some more validation to ensure, for example, that the API/APP urls are
    // actually valid urls (and always strip trailing slashs)
    MachinaConfig::init_from_env().map_err(|error| match error {
        envconfig::Error::EnvVarMissing { name } => MachinaConfigError::MissingRequired(name),
        envconfig::Error::ParseError { name } => MachinaConfigError::ParseError(name),
    })
}
