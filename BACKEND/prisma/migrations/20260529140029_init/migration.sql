/*
  Warnings:

  - You are about to drop the column `status` on the `order` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `reservation` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(2))`.
  - You are about to alter the column `paymentMethod` on the `transaction` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.
  - You are about to alter the column `status` on the `transaction` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(2))`.

*/
-- AlterTable
ALTER TABLE `menu` MODIFY `isAvailable` BOOLEAN NULL DEFAULT true;

-- AlterTable
ALTER TABLE `order` DROP COLUMN `status`;

-- AlterTable
ALTER TABLE `reservation` MODIFY `status` ENUM('PENDING', 'PAID', 'NOT_PAID') NOT NULL DEFAULT 'PAID';

-- AlterTable
ALTER TABLE `transaction` MODIFY `paymentMethod` ENUM('CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'E_WALLET') NOT NULL,
    MODIFY `status` ENUM('PENDING', 'PAID', 'NOT_PAID') NOT NULL DEFAULT 'PAID';
