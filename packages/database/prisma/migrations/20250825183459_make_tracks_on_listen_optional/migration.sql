-- DropForeignKey
ALTER TABLE `listen` DROP FOREIGN KEY `listen_track_id_fkey`;

-- DropIndex
DROP INDEX `listen_track_id_fkey` ON `listen`;

-- AlterTable
ALTER TABLE `artist` ADD COLUMN `imageUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `listen` MODIFY `track_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `listen` ADD CONSTRAINT `listen_track_id_fkey` FOREIGN KEY (`track_id`) REFERENCES `track`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
