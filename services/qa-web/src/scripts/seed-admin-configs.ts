import { prisma } from "../lib/prisma";
import { ROLE_PRESETS } from "../lib/permissions";

async function main() {
  console.log("🌱 Starting seed for Admin Configurations & Role Presets...");

  // 1. Seed Academic Years & Terms
  const academicYears = [
    { year: "2569", semester: "1", label: "ภาคเรียนที่ 1", isCurrent: false },
    { year: "2569", semester: "2", label: "ภาคเรียนที่ 2", isCurrent: false },
    { year: "2568", semester: "1", label: "ภาคเรียนที่ 1", isCurrent: true },
    { year: "2568", semester: "2", label: "ภาคเรียนที่ 2", isCurrent: false },
    { year: "2567", semester: "1", label: "ภาคเรียนที่ 1", isCurrent: false },
    { year: "2567", semester: "2", label: "ภาคเรียนที่ 2", isCurrent: false },
    { year: "2566", semester: "1", label: "ภาคเรียนที่ 1", isCurrent: false },
    { year: "2566", semester: "2", label: "ภาคเรียนที่ 2", isCurrent: false },
    { year: "2565", semester: "1", label: "ภาคเรียนที่ 1", isCurrent: false },
    { year: "2565", semester: "2", label: "ภาคเรียนที่ 2", isCurrent: false },
  ];

  for (const item of academicYears) {
    await prisma.academicYearConfig.upsert({
      where: {
        year_semester: {
          year: item.year,
          semester: item.semester,
        },
      },
      update: {
        label: item.label,
        isCurrent: item.isCurrent,
        isActive: true,
      },
      create: {
        year: item.year,
        semester: item.semester,
        label: item.label,
        isCurrent: item.isCurrent,
        isActive: true,
      },
    });
  }
  console.log(`✅ Seeded ${academicYears.length} Academic Year & Term records.`);

  // 2. Seed Class Sections & Majors
  const majors = [
    { name: "ช่างเทคนิคคอมพิวเตอร์", code: "ชทค" },
    { name: "เทคโนโลยีสารสนเทศ", code: "สทค" },
    { name: "ช่างอิเล็กทรอนิกส์", code: "ชอท" },
    { name: "ช่างไฟฟ้ากำลัง", code: "ชฟก" },
    { name: "การบัญชี", code: "พบช" },
  ];

  const sectionsToSeed: Array<{
    level: string;
    year: string;
    majorName: string;
    majorCode: string;
    room: string;
    sortOrder: number;
  }> = [];

  let sort = 1;
  // ปวช.1 - 3
  for (const year of ["1", "2", "3"]) {
    for (const m of majors) {
      for (const room of ["1", "2"]) {
        sectionsToSeed.push({
          level: "ปวช",
          year,
          majorName: m.name,
          majorCode: m.code,
          room,
          sortOrder: sort++,
        });
      }
    }
  }

  // ปวส.1 - 2
  for (const year of ["1", "2"]) {
    for (const m of majors) {
      for (const room of ["1", "2"]) {
        sectionsToSeed.push({
          level: "ปวส",
          year,
          majorName: m.name,
          majorCode: m.code,
          room,
          sortOrder: sort++,
        });
      }
    }
  }

  for (const sec of sectionsToSeed) {
    await prisma.classSectionConfig.upsert({
      where: {
        level_year_majorCode_room: {
          level: sec.level,
          year: sec.year,
          majorCode: sec.majorCode,
          room: sec.room,
        },
      },
      update: {
        majorName: sec.majorName,
        sortOrder: sec.sortOrder,
        isActive: true,
      },
      create: {
        level: sec.level,
        year: sec.year,
        majorName: sec.majorName,
        majorCode: sec.majorCode,
        room: sec.room,
        sortOrder: sec.sortOrder,
        isActive: true,
      },
    });
  }
  console.log(`✅ Seeded ${sectionsToSeed.length} Class Section & Major records.`);

  // 3. Seed/Update Roles with Presets
  for (const preset of ROLE_PRESETS) {
    const isSystem = preset.code === "ROOT" || preset.code === "STAFF";
    await prisma.roleDefinition.upsert({
      where: { code: preset.code },
      update: {
        title: preset.title,
        description: preset.description,
        color: preset.color,
        permissions: preset.permissions,
      },
      create: {
        code: preset.code,
        title: preset.title,
        description: preset.description,
        color: preset.color,
        permissions: preset.permissions,
        isSystem,
      },
    });
  }
  console.log(`✅ Seeded ${ROLE_PRESETS.length} Role Definition Presets.`);

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
