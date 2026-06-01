-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('MICRO_TASK', 'REMINDER', 'GOAL');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- AlterTable
ALTER TABLE "sub_tasks" ADD COLUMN     "difficulty" "Difficulty" NOT NULL DEFAULT 'EASY',
ADD COLUMN     "estimated_minutes" INTEGER NOT NULL DEFAULT 5;

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "task_type" "TaskType" NOT NULL DEFAULT 'MICRO_TASK';
