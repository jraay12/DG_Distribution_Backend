/*
  Warnings:

  - Added the required column `visit_date` to the `StoreVisit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `StoreVisit` ADD COLUMN `visit_date` DATETIME(3) NOT NULL;
