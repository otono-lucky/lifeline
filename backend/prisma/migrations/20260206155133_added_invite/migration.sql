/*
  Warnings:

  - You are about to drop the column `acceptedAt` on the `invites` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `invites` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `invites` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `churchId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lga` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `users` table. All the data in the column will be lost.
  - Added the required column `createdBy` to the `churches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByAccountId` to the `invites` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `invites` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InviteType" AS ENUM ('ChurchAdmin', 'Counselor');

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_churchId_fkey";

-- AlterTable
ALTER TABLE "churches" ADD COLUMN     "createdBy" UUID NOT NULL;

-- AlterTable
ALTER TABLE "invites" DROP COLUMN "acceptedAt",
DROP COLUMN "role",
DROP COLUMN "status",
ADD COLUMN     "createdByAccountId" UUID NOT NULL,
ADD COLUMN     "type" "InviteType" NOT NULL,
ADD COLUMN     "used" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "usedAt" TIMESTAMP(3),
ALTER COLUMN "churchId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "address",
DROP COLUMN "churchId",
DROP COLUMN "city",
DROP COLUMN "lga",
DROP COLUMN "state",
ADD COLUMN     "church" TEXT,
ADD COLUMN     "originCountry" TEXT,
ADD COLUMN     "originLga" TEXT,
ADD COLUMN     "originState" TEXT,
ADD COLUMN     "residenceAddress" TEXT,
ADD COLUMN     "residenceCity" TEXT,
ADD COLUMN     "residenceCountry" TEXT,
ADD COLUMN     "residenceState" TEXT;

-- DropEnum
DROP TYPE "InviteStatus";

-- AddForeignKey
ALTER TABLE "churches" ADD CONSTRAINT "churches_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "super_admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_createdByAccountId_fkey" FOREIGN KEY ("createdByAccountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
