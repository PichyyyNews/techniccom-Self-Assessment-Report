import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { prisma } from "../lib/prisma";

async function main() {
  console.log("🧹 ========================================================");
  console.log("🧹 เริ่มต้นกระบวนการล้าง Master Configurations ทั้งหมด");
  console.log("🧹 ========================================================");

  // 1. Delete Class Section Configs (50 rows -> 0)
  const delSections = await prisma.classSectionConfig.deleteMany({});
  console.log(`🏫 ลบ ClassSectionConfig (กลุ่มเรียน/ห้องเรียน): ${delSections.count} รายการ -> เหลือ 0`);

  // 2. Delete Academic Year Configs (10 rows -> 0)
  const delYears = await prisma.academicYearConfig.deleteMany({});
  console.log(`📅 ลบ AcademicYearConfig (รอบปีการศึกษาและภาคเรียน): ${delYears.count} รายการ -> เหลือ 0`);

  // 3. Delete Department Profiles (2 rows -> 0)
  const delDept = await prisma.departmentProfile.deleteMany({});
  console.log(`🏢 ลบ DepartmentProfile (ข้อมูลบริบทแผนกวิชา): ${delDept.count} รายการ -> เหลือ 0`);

  // 4. Delete License Type Configs & Categories (8 + 3 -> 0)
  const delTypes = await prisma.licenseTypeConfig.deleteMany({});
  const delCats = await prisma.licenseCategoryConfig.deleteMany({});
  console.log(`📜 ลบ LicenseTypeConfig (ประเภทใบอนุญาต): ${delTypes.count} รายการ -> เหลือ 0`);
  console.log(`📂 ลบ LicenseCategoryConfig (หมวดหมู่ใบอนุญาต): ${delCats.count} รายการ -> เหลือ 0`);

  // 5. Clean Non-System Role Definitions (6 rows -> เหลือเฉพาะ ROOT 1 รายการ)
  // หรือถ้าต้องการลบทั้งหมด ให้ปลด FK ก่อน
  const delRoles = await prisma.roleDefinition.deleteMany({
    where: {
      code: {
        not: "ROOT",
      },
    },
  });
  console.log(`🛡️ ลบ RoleDefinition ทั่วไป: ${delRoles.count} รายการ (คงเหลือเฉพาะ ROOT สำหรับ Super Admin)`);

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

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("❌ Error:", e);
  await prisma.$disconnect();
  process.exit(1);
});
