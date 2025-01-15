-- CreateEnum
CREATE TYPE "WinnerType" AS ENUM ('PIRATE', 'MARIN', 'SIRENE');

-- CreateTable
CREATE TABLE "GameMonoDevice" (
    "id" UUID NOT NULL,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "who_won" "WinnerType" NOT NULL,
    "terminated_at" TIMESTAMP(3),
    "game_duration" DOUBLE PRECISION,

    CONSTRAINT "GameMonoDevice_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GameMonoDevice" ADD CONSTRAINT "GameMonoDevice_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
