-- AlterTable
ALTER TABLE "transaction" ADD COLUMN     "network" TEXT,
ADD COLUMN     "walletAddress" TEXT,
ADD COLUMN     "withdrawalMethod" TEXT;
