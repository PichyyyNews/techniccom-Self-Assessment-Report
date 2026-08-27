"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import { LogOut, Shield, Users, User, Phone, Briefcase } from "lucide-react";
import Link from "next/link";

export function Navbar({ areaTitle }: { areaTitle?: string }) {
  const { data: session } = useSession();

  const isRoot = session?.user?.role === "ROOT";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-8 backdrop-blur transition-all">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-slate-800 transition hover:opacity-85">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/20">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg tracking-tight text-blue-900 font-extrabold">TechSAR</span>
            <span className="ml-1 text-xs text-slate-500 font-medium hidden sm:inline">
              | {areaTitle || "ระบบงานประกันคุณภาพ"}
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {session?.user ? (
          <div className="flex items-center gap-3">
            {/* Quick Action Button for ROOT */}
            {isRoot && (
              <Link
                href="/admin/users"
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 active:scale-95"
              >
                <Users className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden sm:inline">จัดการผู้ใช้งาน</span>
              </Link>
            )}

            {/* Profile Info */}
            <div className="hidden md:block text-right">
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-xs font-bold text-slate-800">{session.user.name}</span>
                {isRoot ? (
                  <span className="px-2 py-0.5 text-[10px] font-black rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                    ROOT
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                    บุคลากร
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400">
                {session.user.position ? `${session.user.position} • ` : ""}
                {session.user.email}
              </div>
            </div>

            <div className="h-7 w-px bg-slate-200 hidden sm:block" />

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 active:scale-95"
              title="ออกจากระบบ"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
          >
            <User className="h-3.5 w-3.5" />
            เข้าสู่ระบบ
          </Link>
        )}
      </div>
    </header>
  );
}
