-- CreateEnum
CREATE TYPE "GenderType" AS ENUM ('Male', 'Female');

-- CreateEnum
CREATE TYPE "MatchPreferenceType" AS ENUM ('my_church', 'my_church_plus', 'other_churches');

-- CreateEnum
CREATE TYPE "SubscriptionTierType" AS ENUM ('free', 'premium');

-- CreateEnum
CREATE TYPE "SubscriptionStatusType" AS ENUM ('active', 'expired', 'canceled');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "gender" "GenderType" NOT NULL,
    "originCountry" TEXT,
    "originState" TEXT,
    "originLga" TEXT,
    "residenceCountry" TEXT,
    "residenceState" TEXT,
    "residenceCity" TEXT,
    "residenceAddress" TEXT,
    "occupation" TEXT,
    "interests" JSONB,
    "church" TEXT,
    "matchPreference" "MatchPreferenceType",
    "subscriptionTier" "SubscriptionTierType" NOT NULL DEFAULT 'free',
    "subscriptionStatus" "SubscriptionStatusType" NOT NULL DEFAULT 'active',
    "subscriptionExpiresAt" TIMESTAMP(3),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
