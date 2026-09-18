/*
  Warnings:

  - The `role` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "factories" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "factories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skus" (
    "id" SERIAL NOT NULL,
    "factoryId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manufacturing_scores" (
    "id" SERIAL NOT NULL,
    "factoryId" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manufacturing_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manufacturing_score_skus" (
    "id" SERIAL NOT NULL,
    "manufacturingScoreId" INTEGER NOT NULL,
    "skuId" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manufacturing_score_skus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "factories_code_key" ON "factories"("code");

-- CreateIndex
CREATE UNIQUE INDEX "skus_factoryId_code_key" ON "skus"("factoryId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "manufacturing_scores_factoryId_month_year_key" ON "manufacturing_scores"("factoryId", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "manufacturing_score_skus_manufacturingScoreId_skuId_key" ON "manufacturing_score_skus"("manufacturingScoreId", "skuId");

-- AddForeignKey
ALTER TABLE "skus" ADD CONSTRAINT "skus_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "factories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manufacturing_scores" ADD CONSTRAINT "manufacturing_scores_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "factories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manufacturing_score_skus" ADD CONSTRAINT "manufacturing_score_skus_manufacturingScoreId_fkey" FOREIGN KEY ("manufacturingScoreId") REFERENCES "manufacturing_scores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manufacturing_score_skus" ADD CONSTRAINT "manufacturing_score_skus_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "skus"("id") ON DELETE CASCADE ON UPDATE CASCADE;
