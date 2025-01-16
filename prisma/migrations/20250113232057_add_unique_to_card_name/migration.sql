/*
  Warnings:

  - The primary key for the `Card` table will be changed. If it partially fails, the table could be left without a primary key constraint.
  - A unique constraint covering the columns `[name]` on the table `Card` will be added. If there are existing duplicate values, this will fail.
*/

-- Temporarily disable foreign key constraints
-- Supprimer la contrainte de clé étrangère temporairement
ALTER TABLE "CardAction" DROP CONSTRAINT "CardAction_card_id_fkey";

-- Modifier la colonne `card_id` pour qu'elle corresponde au type `id` de `Card`
ALTER TABLE "CardAction" ALTER COLUMN "card_id" SET DATA TYPE TEXT;

-- Modifier la table `Card`
ALTER TABLE "Card"
DROP CONSTRAINT "Card_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "type" SET DATA TYPE TEXT,
ALTER COLUMN "name" SET DATA TYPE TEXT,
ADD CONSTRAINT "Card_pkey" PRIMARY KEY ("id");

-- Recréer la contrainte de clé étrangère
ALTER TABLE "CardAction"
ADD CONSTRAINT "CardAction_card_id_fkey"
FOREIGN KEY ("card_id") REFERENCES "Card"("id") ON DELETE CASCADE;

-- Créer l'index unique sur `name`
CREATE UNIQUE INDEX "Card_name_key" ON "Card"("name");
