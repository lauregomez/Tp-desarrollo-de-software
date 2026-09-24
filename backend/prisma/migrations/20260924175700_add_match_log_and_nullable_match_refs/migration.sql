-- DropForeignKey
ALTER TABLE `matches` DROP FOREIGN KEY `matches_away_club_id_fkey`;

-- DropForeignKey
ALTER TABLE `matches` DROP FOREIGN KEY `matches_court_id_fkey`;

-- DropForeignKey
ALTER TABLE `matches` DROP FOREIGN KEY `matches_home_club_id_fkey`;

-- AlterTable
ALTER TABLE `matches` MODIFY `home_club_id` INTEGER NULL,
    MODIFY `away_club_id` INTEGER NULL,
    MODIFY `court_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `match_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(500) NOT NULL,
    `match_id` INTEGER NULL,
    `created_by_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `matches` ADD CONSTRAINT `matches_home_club_id_fkey` FOREIGN KEY (`home_club_id`) REFERENCES `clubs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matches` ADD CONSTRAINT `matches_away_club_id_fkey` FOREIGN KEY (`away_club_id`) REFERENCES `clubs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matches` ADD CONSTRAINT `matches_court_id_fkey` FOREIGN KEY (`court_id`) REFERENCES `courts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `match_logs` ADD CONSTRAINT `match_logs_match_id_fkey` FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `match_logs` ADD CONSTRAINT `match_logs_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
