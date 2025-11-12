/*
  Warnings:

  - A unique constraint covering the columns `[session,courseCode,programmeId]` on the table `courses` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."courses_session_courseCode_key";

-- CreateIndex
CREATE UNIQUE INDEX "courses_session_courseCode_programmeId_key" ON "courses"("session", "courseCode", "programmeId");
