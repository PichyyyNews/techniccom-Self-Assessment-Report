import React from "react";
import { prisma } from "@/lib/prisma";
import {
  LayoutDashboard,
  Users,
  Award,
  Calendar,
  Building2,
  TrendingUp,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const [usersCount, standardsCount, indicatorsCount, departmentsCount, academicYear] = await Promise.all([
    prisma.user.count(),
    prisma.standard.count(),
    prisma.indicator.count(),
    prisma.department.count(),
    prisma.academicYear.findFirst({ where: { isActive: true } }),
  ]);

  const departments = await prisma.department.findMany({
    include: {
      _count: {
        select: { users: true },
      },
    },
    orderBy: { code: "asc" },
  });

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white shadow-lg shadow-blue-500/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <ShieldCheck className="h-3.5 w-3.5" />
              ศูนย์บัญชาการระบบประกันคุณภาพ (TechSAR Admin)
            </span>
            <h1 className="mt-3 text-3xl font-black tracking-tight">
              ภาพรวมระบบประกันคุณภาพวิทยาลัย
            </h1>
            <p className="mt-1 text-sm text-blue-100 max-w-2xl">
              รอบปีการศึกษา {academicYear?.year || 2569} • สังกัดสำนักงานคณะกรรมการการอาชีวศึกษา (สอศ.)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-blue-700 shadow-md transition hover:bg-blue-50 active:scale-95"
            >
              <Users className="h-4 w-4" />
              จัดการผู้ใช้
            </Link>
            <Link
              href="/admin/standards"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/20 active:scale-95"
            >
              <Award className="h-4 w-4" />
              ดูเกณฑ์ 21 ตัวบ่งชี้
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">ผู้ใช้งานในระบบ</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{usersCount}</span>
            <span className="text-xs text-slate-500 font-medium">บัญชีที่ลงทะเบียน</span>
          </div>
          <Link href="/admin/users" className="mt-4 flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
            ดูรายชื่อทั้งหมด <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">มาตรฐาน สอศ.</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{standardsCount}</span>
            <span className="text-xs text-slate-500 font-medium">มาตรฐาน ({indicatorsCount} ตัวบ่งชี้)</span>
          </div>
          <Link href="/admin/standards" className="mt-4 flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700">
            ดูเกณฑ์การประเมิน <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">แผนกวิชา</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{departmentsCount}</span>
            <span className="text-xs text-slate-500 font-medium">แผนกที่เปิดประเมิน</span>
          </div>
          <div className="mt-4 text-xs text-slate-400 font-medium">
            พร้อมจัดทำเล่มรายงาน SAR
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">รอบปีการศึกษา</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{academicYear?.year || 2569}</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              กำลังเปิดรับผลงาน
            </span>
          </div>
          <Link href="/admin/academic-years" className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700">
            จัดการรอบปีการศึกษา <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Departments Overview Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">แผนกวิชาในระบบและบุคลากร</h2>
            <p className="text-xs text-slate-500">รายชื่อแผนกวิชาและจำนวนครูผู้รับผิดชอบงานประกันคุณภาพ</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50/50 p-4 transition hover:bg-blue-50/30 hover:border-blue-200"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-slate-200 text-blue-600 font-bold text-xs shadow-2xs">
                  {dept.code}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{dept.nameTh}</h4>
                  <span className="text-xs text-slate-500">{dept.nameEn || "Department"}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100/70 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                  {dept._count.users} คน
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
