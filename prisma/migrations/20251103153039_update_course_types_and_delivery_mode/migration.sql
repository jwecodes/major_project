/*
  Warnings:

  - The values [THEORY,PRACTICAL,LAB] on the enum `CourseType` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "DeliveryMode" AS ENUM ('THEORY', 'PRACTICAL', 'BOTH');

-- AlterEnum
BEGIN;
CREATE TYPE "CourseType_new" AS ENUM ('CORE', 'SEC', 'INDUSTRY', 'SKILL', 'VAC', 'OPEN_ELECTIVE', 'AEC', 'DSE', 'INTERNSHIP', 'PROJECT', 'MOOC', 'CS', 'OTHER');
ALTER TABLE "courses" ALTER COLUMN "courseType" TYPE "CourseType_new" USING ("courseType"::text::"CourseType_new");
ALTER TYPE "CourseType" RENAME TO "CourseType_old";
ALTER TYPE "CourseType_new" RENAME TO "CourseType";
DROP TYPE "public"."CourseType_old";
COMMIT;

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "deliveryMode" "DeliveryMode" NOT NULL DEFAULT 'THEORY';
