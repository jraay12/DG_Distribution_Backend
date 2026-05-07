-- AlterTable
ALTER TABLE `StockMovement` ADD COLUMN `store_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `StockMovement` ADD CONSTRAINT `StockMovement_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `Customer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
