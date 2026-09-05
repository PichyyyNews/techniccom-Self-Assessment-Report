import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { prisma } from "../lib/prisma";

async function main() {
  console.log("=== DB RECORD COUNTS ===");
  const counts = {
    users: await prisma.user.count(),
    roles: await prisma.roleDefinition.count(),
    students: await prisma.student.count(),
    courses: await prisma.course.count(),
    teachingAssignments: await prisma.teachingAssignment.count(),
    attendanceSessions: await prisma.attendanceSession.count(),
    attendanceRecords: await prisma.attendanceRecord.count(),
    evidenceFiles: await prisma.evidenceFile.count(),
    teacherLicenses: await prisma.teacherLicense.count(),
    activityLogs: await prisma.activityLog.count(),
    academicYearConfigs: await prisma.academicYearConfig.count(),
    classSectionConfigs: await prisma.classSectionConfig.count(),
    departmentProfiles: await prisma.departmentProfile.count(),
    licenseCategoryConfigs: await prisma.licenseCategoryConfig.count(),
    licenseTypeConfigs: await prisma.licenseTypeConfig.count(),
  };
  console.log(JSON.stringify(counts, null, 2));

  const files = await prisma.evidenceFile.findMany({
    select: { id: true, title: true, fileName: true, fileKey: true, category: true },
  });
  console.log("FILES:", JSON.stringify(files, null, 2));

  const courses = await prisma.course.findMany({
    select: { id: true, courseCode: true, courseName: true },
  });
  console.log("COURSES:", JSON.stringify(courses, null, 2));

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, roleCode: true },
  });
  console.log("USERS:", JSON.stringify(users, null, 2));

  const dept = await prisma.departmentProfile.findMany();
  console.log("DEPT:", JSON.stringify(dept, null, 2));

  await prisma.$disconnect();
}

main().catch(console.error);
