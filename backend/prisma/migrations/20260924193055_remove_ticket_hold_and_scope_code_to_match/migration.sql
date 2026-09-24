/*
  Warnings:

  - You are about to drop the column `reserved_until` on the `tickets` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[match_id,code]` on the table `tickets` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `tickets_code_key` ON `tickets`;

-- AlterTable
ALTER TABLE `tickets` DROP COLUMN `reserved_until`;

-- CreateIndex
CREATE UNIQUE INDEX `tickets_match_id_code_key` ON `tickets`(`match_id`, `code`);
