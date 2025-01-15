/*
  Warnings:

  - Added the required column `username` to the `Player` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "username" VARCHAR(50) NOT NULL;
