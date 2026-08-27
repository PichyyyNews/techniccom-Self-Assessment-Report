import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    email?: string | null;
    name?: string | null;
    role: string; // roleCode e.g. "ROOT", "STAFF", "DEPT_HEAD"
    roleTitle?: string | null;
    roleColor?: string | null;
    permissions?: string[];
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
      role: string;
      roleTitle?: string | null;
      roleColor?: string | null;
      permissions?: string[];
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
    role: string;
    roleTitle?: string | null;
    roleColor?: string | null;
    permissions?: string[];
    position?: string | null;
    phone?: string | null;
    birthDate?: string | null;
    avatarUrl?: string | null;
    isActive?: boolean;
  }
}
