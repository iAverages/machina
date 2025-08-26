/*
  Warnings:

  - Made the column `track_id` on table `listen` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `listen` DROP FOREIGN KEY `listen_track_id_fkey`;

-- DropIndex
DROP INDEX `listen_track_id_fkey` ON `listen`;

-- AlterTable
ALTER TABLE `listen` MODIFY `track_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `track` MODIFY `name` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `listen` ADD CONSTRAINT `listen_track_id_fkey` FOREIGN KEY (`track_id`) REFERENCES `track`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
