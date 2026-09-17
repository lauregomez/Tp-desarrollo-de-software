-- Se agrega en tres pasos porque la tabla ya tiene canchas:
-- una columna NOT NULL sin valor no se puede agregar a filas existentes.

-- 1. Columna nullable para no romper las filas actuales.
ALTER TABLE `courts` ADD COLUMN `address` VARCHAR(191) NULL;

-- 2. Valor provisorio para las canchas que ya existían.
UPDATE `courts` SET `address` = 'Dirección a completar' WHERE `address` IS NULL;

-- 3. Recién ahora la columna pasa a ser obligatoria, igual que en el schema.
ALTER TABLE `courts` MODIFY `address` VARCHAR(191) NOT NULL;
