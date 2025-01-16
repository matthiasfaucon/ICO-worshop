/*
  Warnings:

  - A unique constraint covering the columns `[player_id,turn_id]` on the table `Vote` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "score" JSONB NOT NULL DEFAULT '{}';

-- CreateIndex
CREATE UNIQUE INDEX "Vote_player_id_turn_id_key" ON "Vote"("player_id", "turn_id");
