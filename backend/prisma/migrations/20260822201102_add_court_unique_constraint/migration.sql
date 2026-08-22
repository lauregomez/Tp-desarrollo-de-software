/*
  Warnings:

  - A unique constraint covering the columns `[club_id,name]` on the table `courts` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `courts_club_id_name_key` ON `courts`(`club_id`, `name`);
