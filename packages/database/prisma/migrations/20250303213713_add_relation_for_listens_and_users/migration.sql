-- AddForeignKey
ALTER TABLE `listen` ADD CONSTRAINT `listen_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
