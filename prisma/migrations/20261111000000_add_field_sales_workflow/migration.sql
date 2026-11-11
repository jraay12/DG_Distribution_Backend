-- AlterTable
ALTER TABLE `Product` MODIFY `category` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Inventory` ADD COLUMN `barcode` VARCHAR(191) NULL,
    ADD COLUMN `case_code` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Customer` ADD COLUMN `barangay` VARCHAR(191) NULL,
    ADD COLUMN `city_municipality` VARCHAR(191) NULL,
    ADD COLUMN `province` VARCHAR(191) NULL,
    ADD COLUMN `street` VARCHAR(191) NULL,
    ADD COLUMN `territory` VARCHAR(191) NULL,
    MODIFY `address` VARCHAR(800) NOT NULL;

-- CreateTable
CREATE TABLE `ProductCategory` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ProductCategory_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VisitInventoryItem` (
    `store_visit_id` VARCHAR(191) NOT NULL,
    `product_id` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `recent_units_out` INTEGER NOT NULL,
    `suggested_quantity` INTEGER NOT NULL,

    PRIMARY KEY (`store_visit_id`, `product_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CustomerOrder` (
    `id` VARCHAR(191) NOT NULL,
    `store_visit_id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `CustomerOrder_store_visit_id_key`(`store_visit_id`),
    INDEX `CustomerOrder_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CustomerOrderItem` (
    `order_id` VARCHAR(191) NOT NULL,
    `product_id` VARCHAR(191) NOT NULL,
    `suggested_quantity` INTEGER NOT NULL,
    `actual_quantity` INTEGER NOT NULL,
    `unit_price` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`order_id`, `product_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PerformanceTarget` (
    `user_id` VARCHAR(191) NOT NULL,
    `brand_id` VARCHAR(191) NOT NULL,
    `period` ENUM('DAILY', 'MONTHLY') NOT NULL,
    `period_date` DATE NOT NULL,
    `sales` DECIMAL(12, 2) NOT NULL,
    `calls` INTEGER NOT NULL,
    `promo` INTEGER NOT NULL,

    PRIMARY KEY (`user_id`, `brand_id`, `period`, `period_date`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Inventory_case_code_key` ON `Inventory`(`case_code`);

-- CreateIndex
CREATE UNIQUE INDEX `Inventory_barcode_key` ON `Inventory`(`barcode`);

-- CreateIndex
CREATE INDEX `Customer_territory_deletedAt_idx` ON `Customer`(`territory`, `deletedAt`);

-- CreateIndex
CREATE INDEX `StoreVisit_visit_date_idx` ON `StoreVisit`(`visit_date`);

-- Keep the existing enum values as stable category IDs for current products and clients.
INSERT INTO `ProductCategory` (`id`, `name`) VALUES
    ('Electronics', 'Electronics'),
    ('Apparel', 'Apparel'),
    ('Books', 'Books'),
    ('Toys', 'Toys'),
    ('Furniture', 'Furniture'),
    ('Misc', 'Misc');

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_category_fkey` FOREIGN KEY (`category`) REFERENCES `ProductCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VisitInventoryItem` ADD CONSTRAINT `VisitInventoryItem_store_visit_id_fkey` FOREIGN KEY (`store_visit_id`) REFERENCES `StoreVisit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VisitInventoryItem` ADD CONSTRAINT `VisitInventoryItem_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomerOrder` ADD CONSTRAINT `CustomerOrder_store_visit_id_fkey` FOREIGN KEY (`store_visit_id`) REFERENCES `StoreVisit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomerOrderItem` ADD CONSTRAINT `CustomerOrderItem_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `CustomerOrder`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomerOrderItem` ADD CONSTRAINT `CustomerOrderItem_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PerformanceTarget` ADD CONSTRAINT `PerformanceTarget_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PerformanceTarget` ADD CONSTRAINT `PerformanceTarget_brand_id_fkey` FOREIGN KEY (`brand_id`) REFERENCES `Brand`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
