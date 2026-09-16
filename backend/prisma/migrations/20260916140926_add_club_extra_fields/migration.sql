-- AlterTable
ALTER TABLE `clubs` ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `founded_year` INTEGER NULL,
    ADD COLUMN `logo_url` VARCHAR(500) NULL;
