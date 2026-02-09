/*
  Warnings:

  - You are about to drop the column `church` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('pending', 'accepted', 'rejected');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "church",
ADD COLUMN     "assignedCounselorId" UUID,
ADD COLUMN     "churchId" UUID,
ADD COLUMN     "verificationNotes" TEXT,
ADD COLUMN     "verificationStatus" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "verifiedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "church_admins_churchId_idx" ON "church_admins"("churchId");

-- CreateIndex
CREATE INDEX "counselors_churchId_idx" ON "counselors"("churchId");

-- CreateIndex
CREATE INDEX "users_churchId_idx" ON "users"("churchId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_assignedCounselorId_fkey" FOREIGN KEY ("assignedCounselorId") REFERENCES "counselors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "churches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
