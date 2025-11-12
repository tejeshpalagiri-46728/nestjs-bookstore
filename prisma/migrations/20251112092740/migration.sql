/*
  Warnings:

  - You are about to alter the column `quantity` on the `Book` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Book" ALTER COLUMN "quantity" SET DATA TYPE INTEGER;
