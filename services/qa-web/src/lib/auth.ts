import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("กรุณากรอกอีเมลและรหัสผ่าน");
        }

        const inputEmail = credentials.email.trim().toLowerCase();
        const rootEmail = (process.env.ROOT_ADMIN_EMAIL || "admin@technic.ac.th").trim().toLowerCase();
        const rootPassword = process.env.ROOT_ADMIN_PASSWORD || "admin1234";

        // 1. Check Root Admin Fallback / Sync
        if (inputEmail === rootEmail && credentials.password === rootPassword) {
          let rootUser = await prisma.user.findUnique({
            where: { email: rootEmail },
            include: { department: true },
          });

          if (!rootUser) {
            const passwordHash = await bcrypt.hash(rootPassword, 10);
            rootUser = await prisma.user.create({
              data: {
                email: rootEmail,
                name: "ผู้ดูแลระบบไอทีวิทยาลัย (Super Admin)",
                role: Role.SUPER_ADMIN,
                passwordHash,
                isActive: true,
              },
              include: { department: true },
            });
          }

          return {
            id: rootUser.id,
            email: rootUser.email,
            name: rootUser.name,
            role: Role.SUPER_ADMIN,
            departmentId: rootUser.departmentId,
            departmentName: rootUser.department?.nameTh || null,
            isActive: true,
          };
        }

        // 2. Standard User Lookup in DB
        const user = await prisma.user.findUnique({
          where: { email: inputEmail },
          include: { department: true },
        });

        if (!user || !user.passwordHash) {
          throw new Error("ไม่พบข้อมูลผู้ใช้งาน หรืออีเมล/รหัสผ่านไม่ถูกต้อง");
        }

        if (user.isActive === false) {
          throw new Error("บัญชีผู้ใช้นี้ถูกปิดการใช้งาน กรุณาติดต่อผู้ดูแลระบบ");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          throw new Error("รหัสผ่านไม่ถูกต้อง");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          departmentId: user.departmentId,
          departmentName: user.department?.nameTh || null,
          isActive: user.isActive,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role as Role;
        token.departmentId = user.departmentId;
        token.departmentName = user.departmentName;
        token.isActive = user.isActive;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.departmentId = token.departmentId as string | null;
        session.user.departmentName = token.departmentName as string | null;
        session.user.isActive = token.isActive as boolean;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "techsar-dev-super-secret-key-32-chars-minimum-length",
};
