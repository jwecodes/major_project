/*
  Warnings:

  - You are about to drop the column `session` on the `faculty` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[facultyId]` on the table `faculty` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."faculty_session_facultyId_key";

-- AlterTable
ALTER TABLE "faculty" DROP COLUMN "session",
ADD COLUMN     "programmeId" TEXT,
ALTER COLUMN "contactNo" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "faculty_facultyId_key" ON "faculty"("facultyId");

-- AddForeignKey
ALTER TABLE "faculty" ADD CONSTRAINT "faculty_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "programmes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
