/*
  Warnings:

  - You are about to drop the column `customer_id` on the `DeliveryReport` table. All the data in the column will be lost.
  - Added the required column `store_visit_id` to the `DeliveryReport` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `DeliveryReport` DROP FOREIGN KEY `DeliveryReport_customer_id_fkey`;

-- DropIndex
DROP INDEX `DeliveryReport_customer_id_fkey` ON `DeliveryReport`;

-- AlterTable
ALTER TABLE `DeliveryReport` DROP COLUMN `customer_id`,
    ADD COLUMN `store_visit_id` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `StoreVisit` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `customer_id` VARCHAR(191) NOT NULL,
    `visted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DeliveryReport` ADD CONSTRAINT `DeliveryReport_store_visit_id_fkey` FOREIGN KEY (`store_visit_id`) REFERENCES `StoreVisit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StoreVisit` ADD CONSTRAINT `StoreVisit_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StoreVisit` ADD CONSTRAINT `StoreVisit_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
