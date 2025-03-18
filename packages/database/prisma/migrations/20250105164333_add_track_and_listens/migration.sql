-- CreateTable
CREATE TABLE `track` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `listen` (
    `id` TIMESTAMP(3) NOT NULL,
    `track_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `listen` ADD CONSTRAINT `listen_track_id_fkey` FOREIGN KEY (`track_id`) REFERENCES `track`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
