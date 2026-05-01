/*
  Warnings:

  - You are about to drop the column `visted` on the `StoreVisit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `StoreVisit` DROP COLUMN `visted`,
    ADD COLUMN `time_in` DATETIME(3) NULL,
    ADD COLUMN `time_out` DATETIME(3) NULL;
