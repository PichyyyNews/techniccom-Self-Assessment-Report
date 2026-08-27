import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding TechSAR QA Database...");

  // 1. Create Academic Year 2569
  const year2569 = await prisma.academicYear.upsert({
    where: { year: 2569 },
    update: {},
    create: {
      year: 2569,
      isActive: true,
      startDate: new Date("2026-05-15"),
      endDate: new Date("2027-04-30"),
    },
  });
  console.log("Created Academic Year:", year2569.year);

  // 2. Create Departments
  const departmentsData = [
    { code: "TECH-COM", nameTh: "แผนกวิชาเทคโนโลยีคอมพิวเตอร์", nameEn: "Computer Technology" },
    { code: "AUTO", nameTh: "แผนกวิชาช่างยนต์", nameEn: "Automotive Technology" },
    { code: "ELEC", nameTh: "แผนกวิชาช่างไฟฟ้ากำลัง", nameEn: "Electrical Power" },
    { code: "ELECTRONIC", nameTh: "แผนกวิชาช่างอิเล็กทรอนิกส์", nameEn: "Electronics" },
    { code: "ACCT", nameTh: "แผนกวิชาการบัญชี", nameEn: "Accounting" },
  ];

  const depts: Record<string, any> = {};
  for (const dept of departmentsData) {
    const created = await prisma.department.upsert({
      where: { code: dept.code },
      update: {},
      create: dept,
    });
    depts[dept.code] = created;
  }
  console.log("Created Departments:", Object.keys(depts).length);

  // 3. Create Users
  const defaultPassword = await bcrypt.hash("admin1234", 10);
  const headPassword = await bcrypt.hash("head1234", 10);
  const teacherPassword = await bcrypt.hash("teacher1234", 10);
  const auditorPassword = await bcrypt.hash("auditor1234", 10);
  const execPassword = await bcrypt.hash("exec1234", 10);

  const users = [
    {
      email: "admin@technic.ac.th",
      name: "ผู้ดูแลระบบประกันคุณภาพ (Super Admin)",
      passwordHash: defaultPassword,
      role: Role.SUPER_ADMIN,
    },
    {
      email: "head.com@technic.ac.th",
      name: "นายหัวหน้า แผนกคอมฯ (Department Head)",
      passwordHash: headPassword,
      role: Role.DEPARTMENT_HEAD,
      departmentId: depts["TECH-COM"].id,
    },
    {
      email: "teacher.com@technic.ac.th",
      name: "อาจารย์ผู้รับผิดชอบตัวบ่งชี้ (Faculty)",
      passwordHash: teacherPassword,
      role: Role.FACULTY,
      departmentId: depts["TECH-COM"].id,
    },
    {
      email: "auditor@technic.ac.th",
      name: "ดร.กรรมการ ประเมินภายใน (Auditor)",
      passwordHash: auditorPassword,
      role: Role.AUDITOR,
    },
    {
      email: "executive@technic.ac.th",
      name: "ผู้อำนวยการวิทยาลัยเทคนิค (Executive)",
      passwordHash: execPassword,
      role: Role.EXECUTIVE,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }
  console.log("Created Users:", users.length);

  // 4. Create Standards and Indicators for Academic Year 2569
  const standardsData = [
    {
      number: 1,
      title: "มาตรฐานที่ 1: คุณลักษณะของผู้สำเร็จการศึกษาอาชีวศึกษาที่พึงประสงค์",
      weight: 30.0,
      indicators: [
        { code: "1.1", title: "ด้านความรู้และผลสัมฤทธิ์ทางการเรียน (V-NET และ GPA)", criteria: "ร้อยละของผู้สำเร็จการศึกษาที่มีผลการทดสอบและผลสัมฤทธิ์ตามเกณฑ์", maxScore: 5.0, weight: 1.0 },
        { code: "1.2", title: "ด้านทักษะวิชาชีพและสมรรถนะตามมาตรฐานอาชีพ", criteria: "ผลการประเมินมาตรฐานวิชาชีพและการแข่งขันทักษะวิชาชีพระดับสถานศึกษา/จังหวัด/ภาค/ชาติ", maxScore: 5.0, weight: 1.0 },
        { code: "1.3", title: "ด้านคุณธรรม จริยธรรม และคุณลักษณะที่พึงประสงค์", criteria: "การมีวินัย ความรับผิดชอบ จิตอาสา และไม่มีปัญหาพฤติกรรมเสี่ยง", maxScore: 5.0, weight: 1.0 },
        { code: "1.4", title: "ด้านนวัตกรรม สิ่งประดิษฐ์ งานสร้างสรรค์ หรืองานวิจัยของผู้เรียน", criteria: "จำนวนและคุณภาพของผลงานนวัตกรรม สิ่งประดิษฐ์คนรุ่นใหม่ที่ได้รับรางวัล", maxScore: 5.0, weight: 1.0 },
        { code: "1.5", title: "ด้านการมีงานทำและศึกษาต่อของผู้สำเร็จการศึกษา", criteria: "ร้อยละของผู้สำเร็จการศึกษาที่มีงานทำ ประกอบอาชีพอิสระ หรือศึกษาต่อภายใน 1 ปี", maxScore: 5.0, weight: 1.0 },
      ],
    },
    {
      number: 2,
      title: "มาตรฐานที่ 2: การจัดการอาชีวศึกษา",
      weight: 30.0,
      indicators: [
        { code: "2.1", title: "ด้านการพัฒนาและปรับปรุงหลักสูตรฐานสมรรถนะ", criteria: "การมีส่วนร่วมของสถานประกอบการในการพัฒนาหลักสูตรรายวิชา", maxScore: 5.0, weight: 1.0 },
        { code: "2.2", title: "ด้านการจัดการเรียนรู้มุ่งเน้นสมรรถนะและ Active Learning", criteria: "แผนการจัดการเรียนรู้ การใช้นวัตกรรม และการจัดการเรียนรู้เชิงรุก", maxScore: 5.0, weight: 1.0 },
        { code: "2.3", title: "ด้านการจัดการศึกษาระบบทวิภาคีและเครือข่ายความร่วมมือ", criteria: "สัดส่วนนักศึกษาระบบทวิภาคี คุณภาพการฝึกอาชีพ และการนิเทศร่วม", maxScore: 5.0, weight: 1.0 },
        { code: "2.4", title: "ด้านการวัดและประเมินผลการเรียนรู้ตามสภาพจริง", criteria: "เครื่องมือวัดผลและเกณฑ์ Rubric Score ที่สอดคล้องกับสมรรถนะรายวิชา", maxScore: 5.0, weight: 1.0 },
        { code: "2.5", title: "ด้านการพัฒนาครูและบุคลากรทางการศึกษา", criteria: "จำนวนชั่วโมงการพัฒนาตนเอง การฝึกอบรมในสถานประกอบการ และการเพิ่มวุฒิ", maxScore: 5.0, weight: 1.0 },
        { code: "2.6", title: "ด้านอาคารสถานที่ ห้องปฏิบัติการ และสิ่งอำนวยความสะดวก", criteria: "ความพร้อม ความปลอดภัย และความทันสมัยของห้องปฏิบัติการและครุภัณฑ์", maxScore: 5.0, weight: 1.0 },
      ],
    },
    {
      number: 3,
      title: "มาตรฐานที่ 3: การสร้างสังคมแห่งการเรียนรู้",
      weight: 15.0,
      indicators: [
        { code: "3.1", title: "ด้านการจัดการความรู้และบริการวิชาการ", criteria: "การจัดทำคลังความรู้และการถ่ายทอดองค์ความรู้แก่นักเรียนและบุคคลภายนอก", maxScore: 5.0, weight: 1.0 },
        { code: "3.2", title: "ด้านการวิจัย นวัตกรรม และสิ่งประดิษฐ์ของครู", criteria: "ผลงานวิจัยในชั้นเรียน นวัตกรรมการสอน และการเผยแพร่ผลงานทางวิชาการ", maxScore: 5.0, weight: 1.0 },
        { code: "3.3", title: "ด้านการใช้เทคโนโลยีดิจิทัลเพื่อการเรียนรู้", criteria: "การประยุกต์ใช้ระบบ LMS แพลตฟอร์มดิจิทัล และสื่อออนไลน์ในการเรียนการสอน", maxScore: 5.0, weight: 1.0 },
      ],
    },
    {
      number: 4,
      title: "มาตรฐานที่ 4: การบริการวิชาชีพและจิตอาสา",
      weight: 15.0,
      indicators: [
        { code: "4.1", title: "ด้านการบริการวิชาการและวิชาชีพสู่ชุมชน (Fix It Center)", criteria: "ผลการดำเนินงานโครงการศูนย์ซ่อมสร้างเพื่อชุมชนและความพึงพอใจของผู้รับบริการ", maxScore: 5.0, weight: 1.0 },
        { code: "4.2", title: "ด้านการจัดฝึกอบรมวิชาชีพระยะสั้นแก่ประชาชน", criteria: "จำนวนหลักสูตรวิชาชีพระยะสั้นและจำนวนผู้ผ่านการฝึกอบรมที่นำไปประกอบอาชีพ", maxScore: 5.0, weight: 1.0 },
        { code: "4.3", title: "ด้านจิตอาสาและการทำนุบำรุงศิลปวัฒนธรรม", criteria: "โครงการจิตอาสาพัฒนาชุมชนและกิจกรรมส่งเสริมประเพณีวัฒนธรรม", maxScore: 5.0, weight: 1.0 },
      ],
    },
    {
      number: 5,
      title: "มาตรฐานที่ 5: การบริหารจัดการและภาวะผู้นำ",
      weight: 10.0,
      indicators: [
        { code: "5.1", title: "ด้านการจัดทำแผนปฏิบัติการประจำปีและการบริหารจัดการ", criteria: "ความสอดคล้องของแผนปฏิบัติการแผนกกับนโยบายวิทยาลัยและการเบิกจ่ายงบประมาณ", maxScore: 5.0, weight: 1.0 },
        { code: "5.2", title: "ด้านระบบการประกันคุณภาพภายในและการประเมินตนเอง (SAR)", criteria: "กระบวนการ PDCA การรวบรวมหลักฐาน และการจัดทำเล่มรายงาน SAR ตรงเวลา", maxScore: 5.0, weight: 1.0 },
        { code: "5.3", title: "ด้านการกำกับ ติดตาม และการนำผลประเมินไปใช้ปรับปรุง", criteria: "การนำข้อเสนอแนะของคณะกรรมการประเมินภายในไปจัดทำแผนพัฒนาคุณภาพ", maxScore: 5.0, weight: 1.0 },
      ],
    },
  ];

  for (const std of standardsData) {
    const createdStd = await prisma.standard.create({
      data: {
        academicYearId: year2569.id,
        standardNumber: std.number,
        title: std.title,
        weight: std.weight,
        indicators: {
          create: std.indicators.map((ind) => ({
            indicatorCode: ind.code,
            title: ind.title,
            criteria: ind.criteria,
            maxScore: ind.maxScore,
            weight: ind.weight,
          })),
        },
      },
      include: { indicators: true },
    });
    console.log("Created Standard " + std.number + " with " + createdStd.indicators.length + " indicators");
  }

  console.log("Seeding TechSAR Completed Successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
