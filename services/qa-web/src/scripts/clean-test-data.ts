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

  // 8. Clean Users: Keep strictly ONLY 1 primary Root Admin user
  const primaryRootEmail = (process.env.ROOT_ADMIN_EMAIL || "admin@technic.ac.th").trim().toLowerCase();
  const secondaryUsers = await prisma.user.findMany({
    where: {
      email: {
        not: primaryRootEmail,
      },
    },
  });

  for (const u of secondaryUsers) {
    if (u.avatarUrl && u.avatarUrl.includes("/profile-photos/")) {
      const photoKey = u.avatarUrl.replace("/api/files/", "");
      try {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: S3_BUCKET,
            Key: photoKey,
          })
        );
        console.log(`   🗑️ ลบรูปโปรไฟล์ผู้ใช้ซ้ำออกจาก MinIO: ${photoKey}`);
      } catch (err: any) {
        console.warn(`   ⚠️ ไม่สามารถลบรูปโปรไฟล์ (${photoKey}):`, err.message);
      }
    }
  }

  const deletedUsers = await prisma.user.deleteMany({
    where: {
      email: {
        not: primaryRootEmail,
      },
    },
  });
  console.log(`\n👤 ลบบัญชีผู้ใช้ส่วนเกิน/บัญชีทดสอบ: ${deletedUsers.count} รายการ (คงเหลือเฉพาะ Root User: ${primaryRootEmail})`);

  // 9. Clean Master Configs (ClassSectionConfig, AcademicYearConfig, DepartmentProfile, LicenseTypeConfig, LicenseCategoryConfig)
  const delSections = await prisma.classSectionConfig.deleteMany({});
  console.log(`\n🏫 ลบ ClassSectionConfig (กลุ่มเรียน/ห้องเรียน): ${delSections.count} รายการ -> เหลือ 0`);

  const delYears = await prisma.academicYearConfig.deleteMany({});
  console.log(`📅 ลบ AcademicYearConfig (รอบปีการศึกษาและภาคเรียน): ${delYears.count} รายการ -> เหลือ 0`);

  const delDept = await prisma.departmentProfile.deleteMany({});
  console.log(`🏢 ลบ DepartmentProfile (ข้อมูลบริบทแผนกวิชา): ${delDept.count} รายการ -> เหลือ 0`);

  const delTypes = await prisma.licenseTypeConfig.deleteMany({});
  const delCats = await prisma.licenseCategoryConfig.deleteMany({});
  console.log(`📜 ลบ LicenseTypeConfig (ประเภทใบอนุญาต): ${delTypes.count} รายการ -> เหลือ 0`);
  console.log(`📂 ลบ LicenseCategoryConfig (หมวดหมู่ใบอนุญาต): ${delCats.count} รายการ -> เหลือ 0`);

  const delRoles = await prisma.roleDefinition.deleteMany({
    where: {
      code: {
        not: "ROOT",
      },
    },
  });
  console.log(`🛡️ ลบ RoleDefinition ทั่วไป: ${delRoles.count} รายการ (คงเหลือเฉพาะ ROOT: 1 แถว)`);

  console.log("\n========================================================");
  console.log("📊 ตรวจสอบจำนวนแถวคงเหลือในฐานข้อมูลทั้งหมด:");
  const counts = {
    Student: await prisma.student.count(),
    LicenseTypeConfig: await prisma.licenseTypeConfig.count(),
    TeachingAssignment: await prisma.teachingAssignment.count(),
    EvidenceFile: await prisma.evidenceFile.count(),
    Course: await prisma.course.count(),
    ClassSectionConfig: await prisma.classSectionConfig.count(),
    AcademicYearConfig: await prisma.academicYearConfig.count(),
    LicenseCategoryConfig: await prisma.licenseCategoryConfig.count(),
    User: await prisma.user.count(),
    AttendanceRecord: await prisma.attendanceRecord.count(),
    ActivityLog: await prisma.activityLog.count(),
    RoleDefinition: await prisma.roleDefinition.count(),
    DepartmentProfile: await prisma.departmentProfile.count(),
    AttendanceSession: await prisma.attendanceSession.count(),
    TeacherLicense: await prisma.teacherLicense.count(),
  };

  for (const [table, count] of Object.entries(counts)) {
    console.log(` - ${table}: ${count} แถว`);
  }
  console.log("========================================================");
  console.log("✨ ฐานข้อมูลและระบบจัดเก็บไฟล์ Clean 100% พร้อมสำหรับการนำเข้าข้อมูลจริงเรียบร้อยแล้ว!");

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("❌ เกิดข้อผิดพลาดขณะ Clean ข้อมูล:", e);
  await prisma.$disconnect();
  process.exit(1);
});
