import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("Initializing Roles & Users in TechSAR Database...");

  // 1. Seed / Upsert Default Roles
  const rootRole = await prisma.roleDefinition.upsert({
    where: { code: "ROOT" },
    update: {
      title: "ผู้ดูแลระบบสูงสุด (ROOT)",
      description: "สามารถเข้าถึงได้ทุกหน้าและจัดการผู้ใช้/สิทธิ์ทั้งหมด",
      color: "rose",
      permissions: ["/dashboard", "/admin/users"],
      isSystem: true,
    },
    create: {
      code: "ROOT",
      title: "ผู้ดูแลระบบสูงสุด (ROOT)",
      description: "สามารถเข้าถึงได้ทุกหน้าและจัดการผู้ใช้/สิทธิ์ทั้งหมด",
      color: "rose",
      permissions: ["/dashboard", "/admin/users"],
      isSystem: true,
    },
  });

  const staffRole = await prisma.roleDefinition.upsert({
    where: { code: "STAFF" },
    update: {
      title: "บุคลากรทั่วไป (STAFF)",
      description: "เข้าถึงหน้าหลัก Dashboard และข้อมูลส่วนตัว",
      color: "blue",
      permissions: ["/dashboard"],
      isSystem: false,
    },
    create: {
      code: "STAFF",
      title: "บุคลากรทั่วไป (STAFF)",
      description: "เข้าถึงหน้าหลัก Dashboard และข้อมูลส่วนตัว",
      color: "blue",
      permissions: ["/dashboard"],
      isSystem: false,
    },
  });

  console.log("✅ Roles created:", rootRole.code, staffRole.code);

  // 2. Upsert Root Admin User
  const rootEmail = (process.env.ROOT_ADMIN_EMAIL || "admin@technic.ac.th").trim().toLowerCase();
  const rootPasswordPlain = process.env.ROOT_ADMIN_PASSWORD || "admin1234";
  const rootPasswordHash = await bcrypt.hash(rootPasswordPlain, 10);

  const rootUser = await prisma.user.upsert({
    where: { email: rootEmail },
    update: {
      name: "ผู้ดูแลระบบสูงสุด (Root Admin)",
      roleCode: "ROOT",
      roleDefinitionId: rootRole.id,
      passwordHash: rootPasswordHash,
      isActive: true,
      position: "ผู้ดูแลระบบไอทีวิทยาลัย",
    },
    create: {
      email: rootEmail,
      name: "ผู้ดูแลระบบสูงสุด (Root Admin)",
      passwordHash: rootPasswordHash,
      roleCode: "ROOT",
      roleDefinitionId: rootRole.id,
      position: "ผู้ดูแลระบบไอทีวิทยาลัย",
      isActive: true,
    },
  });

  console.log("✅ Root Admin account linked:", rootUser.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
