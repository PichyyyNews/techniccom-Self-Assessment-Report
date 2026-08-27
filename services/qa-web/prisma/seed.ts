import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("Initializing TechSAR Database...");

  const rootEmail = (process.env.ROOT_ADMIN_EMAIL || "admin@technic.ac.th").trim().toLowerCase();
  const rootPasswordPlain = process.env.ROOT_ADMIN_PASSWORD || "admin1234";
  const rootPasswordHash = await bcrypt.hash(rootPasswordPlain, 10);

  // Upsert the only Root Admin Account
  const rootUser = await prisma.user.upsert({
    where: { email: rootEmail },
    update: {
      name: "ผู้ดูแลระบบสูงสุด (Root Admin)",
      role: Role.ROOT,
      passwordHash: rootPasswordHash,
      isActive: true,
      position: "ผู้ดูแลระบบไอทีวิทยาลัย",
    },
    create: {
      email: rootEmail,
      name: "ผู้ดูแลระบบสูงสุด (Root Admin)",
      passwordHash: rootPasswordHash,
      role: Role.ROOT,
      position: "ผู้ดูแลระบบไอทีวิทยาลัย",
      isActive: true,
    },
  });

  console.log("✅ Root Admin account created/updated successfully:", rootUser.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
