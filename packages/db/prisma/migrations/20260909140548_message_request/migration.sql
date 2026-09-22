-- CreateEnum
CREATE TYPE "MessageRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'IGNORED');

-- AlterTable
ALTER TABLE "MessageRequest" ADD COLUMN     "status" "MessageRequestStatus" NOT NULL DEFAULT 'PENDING';
