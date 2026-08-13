/*
  Warnings:

  - You are about to alter the column `estado` on the `entrada` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `Enum(EnumId(1))`.
  - You are about to drop the column `capacidad` on the `partido` table. All the data in the column will be lost.
  - You are about to alter the column `estado` on the `partido` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `Enum(EnumId(0))`.
  - A unique constraint covering the columns `[nombre]` on the table `Club` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `precioPagado` to the `Entrada` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `entrada` ADD COLUMN `precioPagado` DECIMAL(10, 2) NOT NULL,
    ADD COLUMN `reservaExpiraEn` DATETIME(3) NULL,
    MODIFY `codigo` VARCHAR(191) NULL,
    MODIFY `estado` ENUM('PENDIENTE', 'ACTIVA', 'USADA') NOT NULL DEFAULT 'PENDIENTE';

-- AlterTable
ALTER TABLE `partido` DROP COLUMN `capacidad`,
    MODIFY `precio` DECIMAL(10, 2) NOT NULL,
    MODIFY `estado` ENUM('BORRADOR', 'PUBLICADO', 'FINALIZADO', 'CANCELADO') NOT NULL DEFAULT 'BORRADOR';

-- CreateIndex
CREATE UNIQUE INDEX `Club_nombre_key` ON `Club`(`nombre`);

-- CreateIndex
CREATE INDEX `Entrada_partidoId_estado_idx` ON `Entrada`(`partidoId`, `estado`);
