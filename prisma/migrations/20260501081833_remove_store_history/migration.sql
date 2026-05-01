/*
  Warnings:

  - You are about to drop the `StoreVisitHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `StoreVisitHistory` DROP FOREIGN KEY `StoreVisitHistory_customer_id_fkey`;

-- DropForeignKey
ALTER TABLE `StoreVisitHistory` DROP FOREIGN KEY `StoreVisitHistory_user_id_fkey`;

-- DropTable
DROP TABLE `StoreVisitHistory`;
