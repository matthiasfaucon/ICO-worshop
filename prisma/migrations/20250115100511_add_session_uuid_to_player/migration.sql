/*
  Warnings:

  - Added the required column `session_uuid` to the `Player` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "session_uuid" UUID NOT NULL;
