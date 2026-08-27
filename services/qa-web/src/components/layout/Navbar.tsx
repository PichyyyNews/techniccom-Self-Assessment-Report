"use client";

import { useSession, signOut } from "next-auth/react";
import { LogOut, User, Bell } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const { data: session } = useSession();

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <span className="bg-red-500/10 text-red-600 border border-red-500/20 text-xs px-2 py-0.5 rounded-full font-medium">ผู้ดูแลระบบ</span>;
      case "EXECUTIVE":
        return <span className="bg-purple-500/10 text-purple-600 border border-purple-500/20 text-xs px-2 py-0.5 rounded-full font-medium">ผู้บริหาร</span>;
      case "DEPARTMENT_HEAD":
        return <span className="bg-blue-500/10 text-blue-600 border border-blue-500/20 text-xs px-2 py-0.5 rounded-full font-medium">หัวหน้าแผนก</span>;
      case "FACULTY":
        return <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs px-2 py-0.5 rounded-full font-medium">ครูผู้รับผิดชอบ</span>;
      case "AUDITOR":
        return <span className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-xs px-2 py-0.5 rounded-full font-medium">กรรมการประเมิน</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-full font-medium">ผู้ใช้ทั่วไป</span>;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            ระบบประกันคุณภาพการศึกษา
          </span>
          <h2 className="text-sm font-bold text-slate-800">
            {session?.user?.departmentName || "วิทยาลัยเทคนิค"}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          title="การแจ้งเตือน"
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors relative"
        >
          <Bell className="w-5 h-5" />
          <span className="w-2 h-2 bg-blue-600 rounded-full absolute top-1.5 right-1.5" />
        </button>

        <div className="h-6 w-px bg-slate-200" />

        {session?.user ? (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-slate-800 leading-tight">
                {session.user.name}
              </div>
              <div className="mt-0.5 flex justify-end">
                {getRoleBadge(session.user.role)}
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 font-semibold">
              <User className="w-5 h-5" />
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1 cursor-pointer"
              title="ออกจากระบบ"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            เข้าสู่ระบบ
          </Link>
        )}
      </div>
    </header>
  );
}
