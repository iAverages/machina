use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, Instant};

use bytes::Bytes;
use tokio::sync::RwLock;
use tokio::task;
use tokio::time::sleep;
use tracing::instrument;

use crate::preview::{B2Video, StoredVideo};

#[derive(Debug, thiserror::Error)]
pub enum CacheMangerError {
    #[error("failed to fetch video data")]
    DataFetchError(String),

    #[error("video with id {0} already exists in the cache")]
    AlreadyCached(String),
}

type Cache = Arc<RwLock<HashMap<String, CachedVideoData>>>;
pub struct CacheManger {
    cache: Cache,
}

impl CacheManger {
    pub fn new() -> CacheManger {
        CacheManger {
            cache: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub fn start_cleanup_thread(&self) {
        let cloned_cache = self.cache.clone();
        task::spawn(async move {
            loop {
                CacheManger::cleanup(cloned_cache.clone()).await;
                sleep(Duration::from_secs(60)).await;
            }
        });
    }

    pub async fn has_id(&self, video_id: &String) -> bool {
        let reader = self.cache.read().await;
        reader.get(video_id).is_some()
    }

    /// returns video bytes from local cache, otherwise fetches bytes can caches locally
    pub async fn get_and_cache_video_bytes(&self, video_id: &String) -> Option<Bytes> {
        let reader = self.cache.read().await;
        let local_cache = reader.get(video_id);
        match local_cache {
            Some(cache) => {
                let bytes = cache.bytes.clone();
                let updated_video_data = CachedVideoData {
                    bytes: bytes.clone(),
                    last_accessed: Instant::now(),
                };
                tracing::debug!("updated last_accessed for {}", video_id);
                drop(reader);
                let mut writer = self.cache.write().await;
                writer.insert(video_id.clone(), updated_video_data);
                Some(bytes)
            }
            None => {
                drop(reader);
                let b2_video = B2Video::new(video_id.clone()).await.ok()?;
                let cached = self.cache_video(&b2_video).await;
                if cached.is_err() {
                    return None;
                }
                Some(b2_video.get_file_stream_all().await.ok()?)
            }
        }
    }

    pub async fn cache_video(&self, video: &impl StoredVideo) -> Result<(), CacheMangerError> {
        let video_id = video.get_id();
        if self.cache.read().await.get(&video_id).is_some() {
            return Err(CacheMangerError::AlreadyCached(video_id));
        }

        let video_bytes = video
            .get_file_stream_all()
            .await
            .map_err(|_| CacheMangerError::DataFetchError(video_id.clone()))?;

        let video_data = CachedVideoData {
            bytes: video_bytes,
            last_accessed: Instant::now(),
        };

        let mut cache_write = self.cache.write().await;
        cache_write.insert(video_id, video_data);
        drop(cache_write);
        Ok(())
    }

    async fn cleanup(cache: Cache) -> bool {
        tracing::debug!("cleaning up video cache");
        let reader = cache.read().await;
        let to_remove = reader
            .iter()
            .filter(|(_, video)| {
                Instant::now().duration_since(video.last_accessed) > Duration::from_secs(5 * 60)
            })
            .map(|id| id.0.clone())
            .collect::<Vec<String>>();
        drop(reader);

        if to_remove.is_empty() {
            return false;
        }

        let mut cache_write = cache.write().await;
        for id in to_remove {
            tracing::debug!("removing {} from cache", id);
            cache_write.remove(&id);
        }
        cache_write.shrink_to_fit();
        true
    }
}

#[derive(Clone, Debug)]
struct CachedVideoData {
    bytes: Bytes,
    last_accessed: Instant,
}
