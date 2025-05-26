use std::io::Cursor;
use std::sync::Arc;

use crate::embeds::cache_manager::CacheManger;
use crate::{MACHINA_CONFIG, get_b2};

pub fn get_track_output_path(track_id: String) -> String {
    format!("{}/{}", MACHINA_CONFIG.video_generator_dir, track_id)
}

pub fn get_video_output_path(track_id: String) -> String {
    format!(
        "{}/{}/out.mp4",
        MACHINA_CONFIG.video_generator_dir, track_id
    )
}

pub fn get_og_output_path(track_id: String) -> String {
    format!("{}/{}/og.png", MACHINA_CONFIG.video_generator_dir, track_id)
}

pub fn get_audio_output_path(track_id: String) -> String {
    format!(
        "{}/{}/audio.mp3",
        MACHINA_CONFIG.video_generator_dir, track_id
    )
}

pub fn get_b2_video_path(track_id: String) -> String {
    format!("generated/{}/out.mp4", track_id)
}

pub async fn upload_to_b2(cache: Arc<CacheManger>, track_id: String) {
    tracing::info!("uploading {} to b2", track_id);
    let video_data = cache
        .get_and_cache_video_bytes(&track_id.clone())
        .await
        .unwrap();
    let length = video_data.len() as u64;
    let wrapped = Cursor::new(video_data);
    let a = get_b2()
        .create_upload(
            wrapped,
            get_b2_video_path(track_id.clone()),
            MACHINA_CONFIG.b2_bucket_id.clone(),
            None,
            length,
            None,
        )
        .await;

    let _ = a.start().await;
    tracing::info!("upload for {} complete", track_id);
}
