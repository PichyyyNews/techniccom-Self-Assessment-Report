import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { prisma } from "../lib/prisma";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

async function main() {
  console.log("🧹 ========================================================");
  console.log("🧹 เริ่มต้นกระบวนการล้างข้อมูลทดสอบ (Test/Mock Data Clean-up)");
  console.log("🧹 เพื่อเตรียมความพร้อมสำหรับข้อมูลจริง (Production Data Readiness)");
  console.log("🧹 ========================================================");

  // 1. Delete Evidence Files in MinIO & DB
  const evidenceFiles = await prisma.evidenceFile.findMany();
  console.log(`\n📦 พบไฟล์หลักฐานทดสอบในฐานข้อมูล: ${evidenceFiles.length} รายการ`);

  const { s3Client, S3_BUCKET } = await import("../lib/s3");

  for (const file of evidenceFiles) {
    if (file.fileKey) {
      try {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: S3_BUCKET,
            Key: file.fileKey,
          })
        );
        console.log(`   🗑️ ลบไฟล์ออกจาก MinIO (${S3_BUCKET}): ${file.fileKey}`);
      } catch (err: any) {
        console.warn(`   ⚠️ ไม่สามารถลบไฟล์จาก MinIO (${file.fileKey}):`, err.message);
      }
    }
  }

  const deletedEvidences = await prisma.evidenceFile.deleteMany({});
  console.log(`   ✅ ลบระเบียน EvidenceFile ในฐานข้อมูลแล้ว: ${deletedEvidences.count} รายการ`);

  // 2. Delete Attendance Records & Sessions
  const deletedRecords = await prisma.attendanceRecord.deleteMany({});
  console.log(`\n📝 ลบข้อมูล AttendanceRecord: ${deletedRecords.count} รายการ`);

  const deletedSessions = await prisma.attendanceSession.deleteMany({});
  console.log(`📝 ลบข้อมูล AttendanceSession: ${deletedSessions.count} รายการ`);

  // 3. Delete Teaching Assignments
  const deletedAssignments = await prisma.teachingAssignment.deleteMany({});
  console.log(`\n👨‍🏫 ลบข้อมูล TeachingAssignment: ${deletedAssignments.count} รายการ`);

  // 4. Delete Students (Mock Data)
  const deletedStudents = await prisma.student.deleteMany({});
  console.log(`\n🎓 ลบข้อมูล Student (Mock Data): ${deletedStudents.count} รายการ`);

  // 5. Delete Sample Courses
  const deletedCourses = await prisma.course.deleteMany({});
  console.log(`\n📚 ลบข้อมูล Course (Sample Data): ${deletedCourses.count} รายการ`);

  // 6. Delete Activity Logs (Test logs)
  const deletedLogs = await prisma.activityLog.deleteMany({});
  console.log(`\n📋 ลบข้อมูล ActivityLog (Test Logs): ${deletedLogs.count} รายการ`);

  // 7. Delete Teacher Licenses (if any test data exists)
  const deletedLicenses = await prisma.teacherLicense.deleteMany({});
  console.log(`\n📜 ลบข้อมูล TeacherLicense: ${deletedLicenses.count} รายการ`);

  console.log("\n========================================================");
  console.log("🔍 ตรวจสอบข้อมูล Master Configuration ที่ต้องคงไว้ 100%:");
  const rootUsers = await prisma.user.count({ where: { roleCode: "ROOT" } });
  const allUsers = await prisma.user.count();
  const roles = await prisma.roleDefinition.count();
  const academicYears = await prisma.academicYearConfig.count();
  const classSections = await prisma.classSectionConfig.count();
  const licenseCategories = await prisma.licenseCategoryConfig.count();
  const licenseTypes = await prisma.licenseTypeConfig.count();
  const deptProfiles = await prisma.departmentProfile.count();

  console.log(` - ผู้ดูแลระบบสูงสุด (Root Admins): ${rootUsers} บัญชี (ผู้ใช้ทั้งหมด ${allUsers} บัญชี)`);
  console.log(` - บทบาทและสิทธิ์ระบบ (RoleDefinition): ${roles} บทบาท`);
  console.log(` - ปีการศึกษาและภาคเรียน (AcademicYearConfig): ${academicYears} ภาคเรียน`);
  console.log(` - ห้องเรียนและสาขาวิชา (ClassSectionConfig): ${classSections} กลุ่มเรียน`);
  console.log(` - หมวดหมู่ใบอนุญาตวิชาชีพ (LicenseCategoryConfig): ${licenseCategories} หมวดหมู่`);
  console.log(` - ประเภทใบอนุญาตวิชาชีพ (LicenseTypeConfig): ${licenseTypes} ประเภท`);
  console.log(` - ข้อมูลบริบทแผนกวิชา (DepartmentProfile): ${deptProfiles} ระเบียน`);
  console.log("========================================================");
  console.log("✨ ฐานข้อมูลและระบบจัดเก็บไฟล์พร้อมสำหรับการใช้งานข้อมูลจริงเรียบร้อยแล้ว!");

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("❌ เกิดข้อผิดพลาดขณะ Clean ข้อมูล:", e);
  await prisma.$disconnect();
  process.exit(1);
});
