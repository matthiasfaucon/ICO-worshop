/*
  Warnings:

  - The values [PIRATE,MARIN] on the enum `WinnerType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "WinnerType_new" AS ENUM ('PIRATES', 'MARINS', 'SIRENE');
ALTER TABLE "GameMonoDevice" ALTER COLUMN "who_won" TYPE "WinnerType_new" USING ("who_won"::text::"WinnerType_new");
ALTER TYPE "WinnerType" RENAME TO "WinnerType_old";
ALTER TYPE "WinnerType_new" RENAME TO "WinnerType";
DROP TYPE "WinnerType_old";
COMMIT;
