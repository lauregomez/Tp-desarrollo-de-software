/*
  Warnings:

  - Added the required column `category` to the `matches` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `matches` ADD COLUMN `capacity` INTEGER NULL,
    ADD COLUMN `category` ENUM('PRIMERA', 'RESERVA', 'CUARTA', 'QUINTA') NOT NULL;
