/*
  Warnings:

  - Added the required column `spotify_access_token` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `spotify_expires_at` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `spotify_refresh_token` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `spotify_access_token` VARCHAR(191) NOT NULL,
    ADD COLUMN `spotify_expires_at` DATETIME(3) NOT NULL,
    ADD COLUMN `spotify_refresh_token` VARCHAR(191) NOT NULL;
