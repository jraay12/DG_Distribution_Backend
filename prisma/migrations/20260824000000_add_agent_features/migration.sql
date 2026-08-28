-- AlterTable
ALTER TABLE `Transaction`
    ADD COLUMN `promo_code_id` VARCHAR(191) NULL,
    ADD COLUMN `subtotal_amount` DECIMAL(10, 2) NULL,
    ADD COLUMN `discount_amount` DECIMAL(10, 2) NULL;

-- CreateTable
CREATE TABLE `DailyReport` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `report_date` DATETIME(3) NOT NULL,
    `summary` VARCHAR(191) NOT NULL,
    `corrected_summary` VARCHAR(191) NULL,
    `status` ENUM('SUBMITTED', 'VERIFIED', 'CORRECTED') NOT NULL DEFAULT 'SUBMITTED',
    `admin_remarks` VARCHAR(191) NULL,
    `verified_by` VARCHAR(191) NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reviewedAt` DATETIME(3) NULL,

    UNIQUE INDEX `DailyReport_user_id_report_date_key`(`user_id`, `report_date`),
    INDEX `DailyReport_report_date_idx`(`report_date`),
    INDEX `DailyReport_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AgentQuota` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `period_start` DATETIME(3) NOT NULL,
    `period_end` DATETIME(3) NOT NULL,
    `target_amount` DECIMAL(12, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AgentQuota_user_id_period_start_period_end_key`(`user_id`, `period_start`, `period_end`),
    INDEX `AgentQuota_period_start_period_end_idx`(`period_start`, `period_end`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AgentLocation` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `store_visit_id` VARCHAR(191) NULL,
    `latitude` DOUBLE NOT NULL,
    `longitude` DOUBLE NOT NULL,
    `recordedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AgentLocation_user_id_recordedAt_idx`(`user_id`, `recordedAt`),
    INDEX `AgentLocation_store_visit_id_idx`(`store_visit_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Transaction_promo_code_id_idx` ON `Transaction`(`promo_code_id`);
CREATE INDEX `Transaction_createdAt_idx` ON `Transaction`(`createdAt`);

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_promo_code_id_fkey` FOREIGN KEY (`promo_code_id`) REFERENCES `PromoCode`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `DailyReport` ADD CONSTRAINT `DailyReport_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `DailyReport` ADD CONSTRAINT `DailyReport_verified_by_fkey` FOREIGN KEY (`verified_by`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `AgentQuota` ADD CONSTRAINT `AgentQuota_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `AgentLocation` ADD CONSTRAINT `AgentLocation_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `AgentLocation` ADD CONSTRAINT `AgentLocation_store_visit_id_fkey` FOREIGN KEY (`store_visit_id`) REFERENCES `StoreVisit`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
