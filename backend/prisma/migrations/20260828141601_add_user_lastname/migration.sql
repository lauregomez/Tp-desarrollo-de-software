/*
  Warnings:

  - Added the required column `last_name` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `users` ADD COLUMN `last_name` VARCHAR(191) NOT NULL;
