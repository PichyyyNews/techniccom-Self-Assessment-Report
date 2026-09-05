import { prisma } from "../lib/prisma";

async function main() {
  console.log("🌱 Starting seed for Courses, Students, and Teaching Assignments...");

  // 1. Seed Courses
  const courses = [
    {
      courseCode: "20204-2001",
      courseName: "การเขียนโปรแกรมคอมพิวเตอร์",
      theoryHours: 2,
      practiceHours: 2,
      credits: 3,
      level: "ปวช",
      majorCode: "ชทค",
    },
    {
      courseCode: "20204-2002",
      courseName: "ระบบเครือข่ายคอมพิวเตอร์เบื้องต้น",
      theoryHours: 2,
      practiceHours: 2,
      credits: 3,
      level: "ปวช",
      majorCode: "ชทค",
    },
    {
      courseCode: "20204-2006",
      courseName: "การบำรุงรักษาและการซ่อมไมโครคอมพิวเตอร์",
      theoryHours: 1,
      practiceHours: 4,
      credits: 3,
      level: "ปวช",
      majorCode: "ชทค",
    },
    {
      courseCode: "20204-2101",
      courseName: "การสร้างเว็บไซต์",
      theoryHours: 2,
      practiceHours: 2,
      credits: 3,
      level: "ปวช",
      majorCode: "ชทค",
    },
    {
      courseCode: "30901-1002",
      courseName: "การจัดการระบบฐานข้อมูล",
      theoryHours: 2,
      practiceHours: 2,
      credits: 3,
      level: "ปวส",
      majorCode: "ชทค",
    },
    {
      courseCode: "30901-2001",
      courseName: "การวิเคราะห์และออกแบบระบบเชิงวัตถุ",
      theoryHours: 2,
      practiceHours: 2,
      credits: 3,
      level: "ปวส",
      majorCode: "ชทค",
    },
  ];

  const seededCourses: any[] = [];
  for (const c of courses) {
    const item = await prisma.course.upsert({
      where: { courseCode: c.courseCode },
      update: c,
      create: c,
    });
    seededCourses.push(item);
  }
  console.log(`✅ Seeded ${seededCourses.length} Courses.`);

  // 2. Seed Sample Students for ปวช.1 ชทค.1 (year 2568, semester 1)
  const sampleStudents = [
    { studentCode: "68209010001", prefix: "นาย", firstName: "กิตติศักดิ์", lastName: "ทองดี", room: "1", year: "1", level: "ปวช" },
    { studentCode: "68209010002", prefix: "นาย", firstName: "ชานนท์", lastName: "เรืองศรี", room: "1", year: "1", level: "ปวช" },
    { studentCode: "68209010003", prefix: "นาย", firstName: "ณภัทร", lastName: "สุวรรณโชติ", room: "1", year: "1", level: "ปวช" },
    { studentCode: "68209010004", prefix: "นาย", firstName: "ธีรเดช", lastName: "สุขเกษม", room: "1", year: "1", level: "ปวช" },
    { studentCode: "68209010005", prefix: "นางสาว", firstName: "ปวีณา", lastName: "แก้วมณี", room: "1", year: "1", level: "ปวช" },
    { studentCode: "68209010006", prefix: "นางสาว", firstName: "มัทนา", lastName: "บริบูรณ์", room: "1", year: "1", level: "ปวช" },
    { studentCode: "68209010007", prefix: "นาย", firstName: "วรเมธ", lastName: "ชัยชนะ", room: "1", year: "1", level: "ปวช" },
    { studentCode: "68209010008", prefix: "นาย", firstName: "ศุภกิตติ์", lastName: "จิตต์สว่าง", room: "1", year: "1", level: "ปวช" },
    { studentCode: "68209010009", prefix: "นางสาว", firstName: "สิริกร", lastName: "พงษ์เพ็ญ", room: "1", year: "1", level: "ปวช" },
    { studentCode: "68209010010", prefix: "นาย", firstName: "อนันดา", lastName: "วงศ์สว่าง", room: "1", year: "1", level: "ปวช" },
  ];

  for (const s of sampleStudents) {
    await prisma.student.upsert({
      where: {
        studentCode_academicYear_semester: {
          studentCode: s.studentCode,
          academicYear: "2568",
          semester: "1",
        },
      },
      update: {
        prefix: s.prefix,
        firstName: s.firstName,
        lastName: s.lastName,
        room: s.room,
        year: s.year,
        level: s.level,
        majorName: "ช่างเทคนิคคอมพิวเตอร์",
        majorCode: "ชทค",
      },
      create: {
        studentCode: s.studentCode,
        prefix: s.prefix,
        firstName: s.firstName,
        lastName: s.lastName,
        room: s.room,
        year: s.year,
        level: s.level,
        majorName: "ช่างเทคนิคคอมพิวเตอร์",
        majorCode: "ชทค",
        status: "ACTIVE",
        academicYear: "2568",
        semester: "1",
      },
    });
  }
  console.log(`✅ Seeded ${sampleStudents.length} Students in ปวช.1 ชทค.1.`);

  // 3. Assign Teaching Assignments to all existing users
  const users = await prisma.user.findMany();
  for (const user of users) {
    if (seededCourses[0]) {
      await prisma.teachingAssignment.upsert({
        where: {
          courseId_teacherId_academicYear_semester_level_year_majorCode_room: {
            courseId: seededCourses[0].id,
            teacherId: user.id,
            academicYear: "2568",
            semester: "1",
            level: "ปวช",
            year: "1",
            majorCode: "ชทค",
            room: "1",
          },
        },
        update: {},
        create: {
          courseId: seededCourses[0].id,
          teacherId: user.id,
          academicYear: "2568",
          semester: "1",
          level: "ปวช",
          year: "1",
          majorCode: "ชทค",
          room: "1",
          totalPeriods: 72,
        },
      });
    }

    if (seededCourses[1]) {
      await prisma.teachingAssignment.upsert({
        where: {
          courseId_teacherId_academicYear_semester_level_year_majorCode_room: {
            courseId: seededCourses[1].id,
            teacherId: user.id,
            academicYear: "2568",
            semester: "1",
            level: "ปวช",
            year: "1",
            majorCode: "ชทค",
            room: "1",
          },
        },
        update: {},
        create: {
          courseId: seededCourses[1].id,
          teacherId: user.id,
          academicYear: "2568",
          semester: "1",
          level: "ปวช",
          year: "1",
          majorCode: "ชทค",
          room: "1",
          totalPeriods: 72,
        },
      });
    }
  }
  console.log(`✅ Seeded Teaching Assignments for ${users.length} Users.`);

  console.log("🎉 Seed finished successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
