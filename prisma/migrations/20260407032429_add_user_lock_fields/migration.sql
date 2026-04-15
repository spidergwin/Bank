-- AlterTable
ALTER TABLE "user" ADD COLUMN     "isLocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lockedReason" TEXT;
