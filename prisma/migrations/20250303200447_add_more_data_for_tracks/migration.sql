-- AlterTable
ALTER TABLE `track` ADD COLUMN `albumId` VARCHAR(191) NULL,
    ADD COLUMN `artistId` VARCHAR(191) NULL,
    ADD COLUMN `duration` INTEGER NULL,
    ADD COLUMN `explicit` BOOLEAN NULL;

-- CreateTable
CREATE TABLE `artist` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `album` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `coverArt` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `track` ADD CONSTRAINT `track_artistId_fkey` FOREIGN KEY (`artistId`) REFERENCES `artist`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `track` ADD CONSTRAINT `track_albumId_fkey` FOREIGN KEY (`albumId`) REFERENCES `album`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
