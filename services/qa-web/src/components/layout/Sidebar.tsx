"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  FileCheck,
  FolderArchive,
  BookOpenCheck,
  ShieldCheck,
  BarChart3,
  Settings,
  Users,
  Building2,
  FileText,
} from "lucide-react";
import { clsx } from "clsx";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  const navItems = [
    {
      label: "ภาพรวมระบบ (Dashboard)",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["SUPER_ADMIN", "EXECUTIVE", "DEPARTMENT_HEAD", "FACULTY", "AUDITOR"],
    },
    {
      label: "การประเมินตนเอง (SAR)",
      href: "/dashboard/sar",
      icon: FileCheck,
      roles: ["SUPER_ADMIN", "DEPARTMENT_HEAD", "FACULTY", "AUDITOR"],
    },
    {
      label: "คลังหลักฐานร่องรอย (Evidences)",
      href: "/dashboard/evidence",
      icon: FolderArchive,
      roles: ["SUPER_ADMIN", "DEPARTMENT_HEAD", "FACULTY", "AUDITOR"],
    },
    {
      label: "มาตรฐาน & ตัวบ่งชี้ (สอศ.)",
      href: "/dashboard/standards",
      icon: BookOpenCheck,
      roles: ["SUPER_ADMIN", "EXECUTIVE", "DEPARTMENT_HEAD", "FACULTY", "AUDITOR"],
    },
    {
      label: "ตรวจประเมินภายใน (Auditing)",
      href: "/dashboard/audit",
      icon: ShieldCheck,
      roles: ["SUPER_ADMIN", "AUDITOR"],
    },
    {
      label: "รายงาน & เล่ม SAR (Reports)",
      href: "/dashboard/reports",
      icon: FileText,
      roles: ["SUPER_ADMIN", "EXECUTIVE", "DEPARTMENT_HEAD", "AUDITOR"],
    },
    {
      label: "สถิติและการวิเคราะห์ (Analytics)",
      href: "/dashboard/analytics",
      icon: BarChart3,
      roles: ["SUPER_ADMIN", "EXECUTIVE", "DEPARTMENT_HEAD"],
    },
  ];

  const adminItems = [
    {
      label: "จัดการแผนกวิชา",
      href: "/dashboard/admin/departments",
      icon: Building2,
      roles: ["SUPER_ADMIN"],
    },
    {
      label: "จัดการผู้ใช้งานและสิทธิ์",
      href: "/dashboard/admin/users",
      icon: Users,
      roles: ["SUPER_ADMIN"],
    },
    {
      label: "ตั้งค่าระบบ",
      href: "/dashboard/admin/settings",
      icon: Settings,
      roles: ["SUPER_ADMIN"],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 min-h-screen shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
          QA
        </div>
        <div>
          <h1 className="font-bold text-base leading-tight tracking-wide">TechSAR</h1>
          <p className="text-xs text-slate-400">ระบบประกันคุณภาพแผนกวิชา</p>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
        <div>
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            เมนูหลัก
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {role === "SUPER_ADMIN" && (
          <div>
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              ผู้ดูแลระบบ
            </p>
            <nav className="space-y-1">
              {adminItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-400">
        <p className="font-medium text-slate-300">ปีการศึกษา 2569</p>
        <p className="text-[11px]">เกณฑ์มาตรฐาน สอศ. 5 ด้าน</p>
      </div>
    </aside>
  );
}
