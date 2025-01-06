-- AlterTable
ALTER TABLE `user` MODIFY `spotify_expires_at` DATETIME(3) NULL,
    MODIFY `spotify_refresh_token` VARCHAR(191) NULL;
