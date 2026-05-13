/*
  Warnings:

  - You are about to drop the column `fromOuput` on the `Connection` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[fromNodeId,toNodeId,fromOutput,toInput]` on the table `Connection` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "NodeType" ADD VALUE 'GOOGLE_FORM_TRIGGER';

-- DropIndex
DROP INDEX "Connection_fromNodeId_toNodeId_fromOuput_toInput_key";

-- AlterTable
ALTER TABLE "Connection" DROP COLUMN "fromOuput",
ADD COLUMN     "fromOutput" TEXT NOT NULL DEFAULT 'main';

-- CreateIndex
CREATE UNIQUE INDEX "Connection_fromNodeId_toNodeId_fromOutput_toInput_key" ON "Connection"("fromNodeId", "toNodeId", "fromOutput", "toInput");
