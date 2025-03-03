/*
  Warnings:

  - You are about to drop the column `coverArt` on the `album` table. All the data in the column will be lost.
  - You are about to drop the column `albumId` on the `track` table. All the data in the column will be lost.
  - You are about to drop the column `artistId` on the `track` table. All the data in the column will be lost.
  - Added the required column `cover_art` to the `album` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `track` DROP FOREIGN KEY `track_albumId_fkey`;

-- DropForeignKey
ALTER TABLE `track` DROP FOREIGN KEY `track_artistId_fkey`;

-- AlterTable
ALTER TABLE `album` DROP COLUMN `coverArt`,
    ADD COLUMN `cover_art` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `track` DROP COLUMN `albumId`,
    DROP COLUMN `artistId`,
    ADD COLUMN `album_id` VARCHAR(191) NULL,
    ADD COLUMN `artist_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `track` ADD CONSTRAINT `track_artist_id_fkey` FOREIGN KEY (`artist_id`) REFERENCES `artist`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `track` ADD CONSTRAINT `track_album_id_fkey` FOREIGN KEY (`album_id`) REFERENCES `album`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
