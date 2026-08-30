-- DropIndex
DROP INDEX IF EXISTS "match_participants_decision_idx";

-- AlterTable
ALTER TABLE "match_participants" DROP COLUMN IF EXISTS "decision";

-- DropEnum
DROP TYPE IF EXISTS "MatchDecision";
