"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import { LogOut, User, Shield, Building2, Bell } from "lucide-react";
import Link from "next/link";

export function Navbar({ areaTitle }: { areaTitle?: string }) {
  const { data: session } = useSession();

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200">Super Admin</span>;
      case "QA_HEAD":
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200">หัวหน้างานประกัน</span>;
      case "DEPT_HEAD":
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">หัวหน้าแผนกวิชา</span>;
      case "TEACHER":
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">ครูผู้สอน/รับผิดชอบ</span>;
      case "AUDITOR":
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">กรรมการประเมิน</span>;
      default:
        return <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700">ผู้ใช้งาน</span>;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur transition-all">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-800 transition hover:opacity-80">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-500/20">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg tracking-tight text-blue-900 font-extrabold">TechSAR</span>
            <span className="ml-1 text-xs text-slate-500 font-medium">| {areaTitle || "ระบบประกันคุณภาพ"}</span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {session?.user ? (
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-sm font-semibold text-slate-800">{session.user.name}</span>
                {getRoleBadge(session.user.role)}
              </div>
              <div className="flex items-center justify-end gap-1 text-xs text-slate-500">
                {session.user.departmentName && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3 text-slate-400" />
                    {session.user.departmentName}
                  </span>
                )}
                <span>({session.user.email})</span>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-200" />

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600"
              title="ออกจากระบบ"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700"
          >
            <User className="h-4 w-4" />
            เข้าสู่ระบบ
          </Link>
        )}
      </div>
    </header>
  );
}
