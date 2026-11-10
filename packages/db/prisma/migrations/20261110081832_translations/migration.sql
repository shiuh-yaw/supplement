-- AlterTable
ALTER TABLE "Rule" ADD COLUMN     "translations" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "Supplement" ADD COLUMN     "translations" JSONB NOT NULL DEFAULT '{}';
