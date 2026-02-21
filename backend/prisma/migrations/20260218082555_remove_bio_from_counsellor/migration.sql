/*
  Warnings:

  - The values [accepted] on the enum `VerificationStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `yearsExperience` on the `counselors` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "VerificationStatus_new" AS ENUM ('pending', 'in_progress', 'verified', 'rejected');
ALTER TYPE "VerificationStatus" RENAME TO "VerificationStatus_old";
ALTER TYPE "VerificationStatus_new" RENAME TO "VerificationStatus";
DROP TYPE "public"."VerificationStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "counselors" DROP COLUMN "yearsExperience";
