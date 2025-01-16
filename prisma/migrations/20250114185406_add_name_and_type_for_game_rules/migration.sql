/*
  Warnings:

  - Added the required column `name` to the `GameRule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `GameRule` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GameRuleType" AS ENUM ('GLOBAL', 'SPECIFIC');

-- AlterTable
ALTER TABLE "GameRule" ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "type" "GameRuleType" NOT NULL;
