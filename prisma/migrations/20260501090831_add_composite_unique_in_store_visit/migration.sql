/*
  Warnings:

  - A unique constraint covering the columns `[user_id,customer_id,visit_date]` on the table `StoreVisit` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `StoreVisit_user_id_customer_id_visit_date_key` ON `StoreVisit`(`user_id`, `customer_id`, `visit_date`);
