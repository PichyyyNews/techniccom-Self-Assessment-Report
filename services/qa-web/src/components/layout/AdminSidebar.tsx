"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Award,
  Calendar,
  FileText,
  Activity,
  ArrowLeft,
  Settings,
} from "lucide-react";
import { clsx } from "clsx";

export function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      title: "ภาพรวมทั้งระบบ",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "จัดการผู้ใช้งาน (Users)",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "เกณฑ์มาตรฐาน & ตัวบ่งชี้",
      href: "/admin/standards",
      icon: Award,
    },
    {
      title: "รอบปีการศึกษา",
      href: "/admin/academic-years",
      icon: Calendar,
    },
    {
      title: "ประวัติการแก้ไข (Audit Logs)",
      href: "/admin/audit-logs",
      icon: Activity,
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-6">
        <div>
          <div className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            แผงควบคุมระบบ (Admin Area)
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

        <div className="pt-4 border-t border-slate-100">
          <div className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            ทางลัดผู้ใช้งาน
          </div>
          <div className="mt-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-slate-400" />
              สลับไปหน้า ครูผู้รับผิดชอบ (/dashboard)
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 text-xs text-blue-900">
        <div className="flex items-center gap-1.5 font-semibold text-blue-800">
          <Settings className="h-4 w-4 text-blue-600" />
          <span>สิทธิ์ Root Admin</span>
        </div>
        <p className="mt-1 text-slate-600 text-[11px] leading-relaxed">
          จัดการสิทธิ์และผู้ใช้ได้อย่างสมบูรณ์ ข้อมูลถูกบันทึกลง PostgreSQL จริงบน Proxmox CT 102
        </p>
      </div>
    </aside>
  );
}
