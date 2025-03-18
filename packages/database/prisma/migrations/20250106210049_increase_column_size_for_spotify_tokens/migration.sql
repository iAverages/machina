-- AlterTable
ALTER TABLE `user` MODIFY `spotify_access_token` TEXT NOT NULL,
    MODIFY `spotify_refresh_token` TEXT NULL;
