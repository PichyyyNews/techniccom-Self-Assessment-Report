import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";

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

        // 1. Root Admin Fallback / Auto-provisioning
        if (inputEmail === rootEmail && credentials.password === rootPassword) {
          let rootUser = await prisma.user.findUnique({
            where: { email: rootEmail },
            include: { roleDefinition: true },
          });

          if (!rootUser) {
            let rootRole = await prisma.roleDefinition.findUnique({ where: { code: "ROOT" } });
            if (!rootRole) {
              rootRole = await prisma.roleDefinition.create({
                data: {
                  code: "ROOT",
                  title: "ผู้ดูแลระบบสูงสุด (ROOT)",
                  description: "สามารถเข้าถึงได้ทุกหน้าและจัดการผู้ใช้/สิทธิ์ทั้งหมด",
                  color: "rose",
                  permissions: ["/dashboard", "/admin/users"],
                  isSystem: true,
                },
              });
            }

            const passwordHash = await bcrypt.hash(rootPassword, 10);
            rootUser = await prisma.user.create({
              data: {
                email: rootEmail,
                name: "ผู้ดูแลระบบสูงสุด (Root Admin)",
                roleCode: "ROOT",
                roleDefinitionId: rootRole.id,
                passwordHash,
                position: "ผู้ดูแลระบบไอทีวิทยาลัย",
                isActive: true,
              },
              include: { roleDefinition: true },
            });
          }

          return {
            id: rootUser.id,
            email: rootUser.email,
            name: rootUser.name,
            role: rootUser.roleCode,
            roleTitle: rootUser.roleDefinition?.title || "ผู้ดูแลระบบสูงสุด",
            roleColor: rootUser.roleDefinition?.color || "rose",
            permissions: rootUser.roleDefinition?.permissions || ["/dashboard", "/admin/users"],
            position: rootUser.position,
            phone: rootUser.phone,
            birthDate: rootUser.birthDate ? rootUser.birthDate.toISOString() : null,
            avatarUrl: rootUser.avatarUrl,
            isActive: true,
          };
        }

        // 2. Standard User Lookup in DB
        const user = await prisma.user.findUnique({
          where: { email: inputEmail },
          include: { roleDefinition: true },
        });

        if (!user || !user.passwordHash) {
          throw new Error("ไม่พบข้อมูลผู้ใช้งาน หรืออีเมล/รหัสผ่านไม่ถูกต้อง");
        }

        if (user.isActive === false) {
          throw new Error("บัญชีผู้ใช้นี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ");
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
          role: user.roleCode,
          roleTitle: user.roleDefinition?.title || "บุคลากร",
          roleColor: user.roleDefinition?.color || "blue",
          permissions: user.roleDefinition?.permissions || ["/dashboard"],
          position: user.position,
          phone: user.phone,
          birthDate: user.birthDate ? user.birthDate.toISOString() : null,
          avatarUrl: user.avatarUrl,
          isActive: user.isActive,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.roleTitle = user.roleTitle;
        token.roleColor = user.roleColor;
        token.permissions = user.permissions;
        token.position = user.position;
        token.phone = user.phone;
        token.birthDate = user.birthDate;
        token.avatarUrl = user.avatarUrl;
        token.isActive = user.isActive;
      }
      if (trigger === "update" && session) {
        return { ...token, ...session.user };
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            include: { roleDefinition: true },
          });

          if (dbUser) {
            session.user.id = dbUser.id;
            session.user.email = dbUser.email;
            session.user.name = dbUser.name;
            session.user.role = dbUser.roleCode;
            session.user.roleTitle = dbUser.roleDefinition?.title || dbUser.roleCode;
            session.user.roleColor = dbUser.roleDefinition?.color || "blue";
            session.user.permissions = dbUser.roleDefinition?.permissions || (dbUser.roleCode === "ROOT" ? ["/dashboard", "/admin/users"] : ["/dashboard"]);
            session.user.position = dbUser.position;
            session.user.phone = dbUser.phone;
            session.user.birthDate = dbUser.birthDate ? dbUser.birthDate.toISOString() : null;
            session.user.avatarUrl = dbUser.avatarUrl;
            session.user.isActive = dbUser.isActive;
            return session;
          }
        } catch (e) {
          console.error("Error refreshing session from DB:", e);
        }

        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.roleTitle = token.roleTitle as string | null;
        session.user.roleColor = token.roleColor as string | null;
        session.user.permissions = token.permissions as string[] | undefined;
        session.user.position = token.position as string | null;
        session.user.phone = token.phone as string | null;
        session.user.birthDate = token.birthDate as string | null;
        session.user.avatarUrl = token.avatarUrl as string | null;
        session.user.isActive = token.isActive as boolean;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "techsar-dev-super-secret-key-32-chars-minimum-length",
};
