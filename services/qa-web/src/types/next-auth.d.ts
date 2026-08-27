import { Role } from "@prisma/client";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    email?: string | null;
    name?: string | null;
    role: Role;
    position?: string | null;
    phone?: string | null;
    birthDate?: string | null;
    avatarUrl?: string | null;
    isActive?: boolean;
  }

  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      role: Role;
      position?: string | null;
      phone?: string | null;
      birthDate?: string | null;
      avatarUrl?: string | null;
      isActive?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    position?: string | null;
    phone?: string | null;
    birthDate?: string | null;
    avatarUrl?: string | null;
    isActive?: boolean;
  }
}
