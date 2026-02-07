/*
  Warnings:

  - A unique constraint covering the columns `[emailVerificationToken]` on the table `accounts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[passwordResetToken]` on the table `accounts` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "InviteType" ADD VALUE 'Church';

-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "emailVerificationExpiry" TIMESTAMP(3),
ADD COLUMN     "emailVerificationToken" TEXT,
ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "passwordResetExpiry" TIMESTAMP(3),
ADD COLUMN     "passwordResetToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "accounts_emailVerificationToken_key" ON "accounts"("emailVerificationToken");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_passwordResetToken_key" ON "accounts"("passwordResetToken");
