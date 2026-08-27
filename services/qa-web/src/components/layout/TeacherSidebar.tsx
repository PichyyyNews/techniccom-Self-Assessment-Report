"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  CheckSquare,
  FolderArchive,
  FileCheck,
  ShieldAlert,
} from "lucide-react";
import { clsx } from "clsx";

export function TeacherSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isSuperOrQaHead =
    session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "QA_HEAD";

  const navItems = [
    {
      title: "ภาพรวมงานของฉัน",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "ตัวบ่งชี้ที่รับผิดชอบ",
      href: "/indicators",
      icon: CheckSquare,
    },
    {
      title: "คลังหลักฐาน & เอกสาร",
      href: "/evidence",
      icon: FolderArchive,
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-6">
        <div>
          <div className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            เมนูหลัก (Teacher Portal)
          </div>
          <nav className="mt-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 font-semibold shadow-xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon className={clsx("h-4 w-4", isActive ? "text-blue-600" : "text-slate-400")} />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>

        {isSuperOrQaHead && (
          <div className="pt-4 border-t border-slate-100">
            <div className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              ผู้ดูแลระบบ
            </div>
            <div className="mt-2">
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-800 shadow-sm"
              >
                <ShieldAlert className="h-4 w-4 text-amber-400" />
                เข้าสู่ระบบผู้ดูแล (/admin)
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
        <div className="font-semibold text-slate-800">รอบปีการศึกษา 2569</div>
        <p className="mt-0.5 text-[11px] text-slate-500">
          มาตรฐาน สอศ. 5 ด้าน 21 ตัวบ่งชี้
        </p>
      </div>
    </aside>
  );
}
