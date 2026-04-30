/*
  Warnings:

  - You are about to drop the column `user_id` on the `DeliveryReport` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `DeliveryReport` DROP FOREIGN KEY `DeliveryReport_user_id_fkey`;

-- DropIndex
DROP INDEX `DeliveryReport_user_id_fkey` ON `DeliveryReport`;

-- AlterTable
ALTER TABLE `DeliveryReport` DROP COLUMN `user_id`;
