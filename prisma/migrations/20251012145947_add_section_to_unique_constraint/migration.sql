/*
  Warnings:

  - A unique constraint covering the columns `[session,programmeCode,section]` on the table `programmes` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."programmes_session_programmeCode_key";

-- CreateIndex
CREATE UNIQUE INDEX "programmes_session_programmeCode_section_key" ON "programmes"("session", "programmeCode", "section");
