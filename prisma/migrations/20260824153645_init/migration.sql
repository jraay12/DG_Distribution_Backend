-- AlterTable
ALTER TABLE `DailyReport` MODIFY `summary` VARCHAR(191) NOT NULL,
    MODIFY `corrected_summary` VARCHAR(191) NULL,
    MODIFY `admin_remarks` VARCHAR(191) NULL;
