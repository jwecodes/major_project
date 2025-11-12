/*
  Warnings:

  - A unique constraint covering the columns `[session,courseCode]` on the table `courses` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[session,facultyId]` on the table `faculty` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[session,programmeCode]` on the table `programmes` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."courses_courseCode_key";

-- DropIndex
DROP INDEX "public"."faculty_facultyId_key";

-- DropIndex
DROP INDEX "public"."programmes_programmeCode_key";

-- CreateIndex
CREATE UNIQUE INDEX "courses_session_courseCode_key" ON "courses"("session", "courseCode");

-- CreateIndex
CREATE UNIQUE INDEX "faculty_session_facultyId_key" ON "faculty"("session", "facultyId");

-- CreateIndex
CREATE UNIQUE INDEX "programmes_session_programmeCode_key" ON "programmes"("session", "programmeCode");
