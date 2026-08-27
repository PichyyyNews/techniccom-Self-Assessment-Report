import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  CheckSquare,
  FolderArchive,
  Award,
  ArrowUpRight,
  Sparkles,
  Building2,
  Calendar,
  Clock,
} from "lucide-react";
import Link from "next/link";

export default async function TeacherDashboardPage() {
  const session = await getServerSession(authOptions);

  const [standards, academicYear] = await Promise.all([
    prisma.standard.findMany({
      include: {
        indicators: true,
      },
      orderBy: { standardNumber: "asc" },
    }),
    prisma.academicYear.findFirst({ where: { isActive: true } }),
  ]);

  const totalIndicators = standards.reduce((acc, s) => acc + s.indicators.length, 0);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                ปีการศึกษา {academicYear?.year || 2569}
              </span>
              {session?.user?.departmentName && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  <Building2 className="h-3.5 w-3.5 text-slate-500" />
                  {session.user.departmentName}
                </span>
              )}
            </div>

            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              ยินดีต้อนรับ, {session?.user?.name || "อาจารย์ผู้ประเมิน"}
            </h1>
            <p className="mt-1 text-sm text-slate-500 max-w-2xl">
              รายงานการประเมินตนเองระดับแผนกวิชา (Self-Assessment Report: SAR) ตามเกณฑ์มาตรฐาน สอศ.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/indicators"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 active:scale-95"
            >
              <CheckSquare className="h-4 w-4" />
              กรอกคะแนนประเมิน
            </Link>
            <Link
              href="/evidence"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 active:scale-95"
            >
              <FolderArchive className="h-4 w-4 text-slate-500" />
              อัปโหลดหลักฐาน
            </Link>
          </div>
        </div>
      </div>

      {/* Progress Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">ตัวบ่งชี้ทั้งหมด</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <CheckSquare className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{totalIndicators}</span>
            <span className="text-xs text-slate-500 font-medium">ตัวบ่งชี้ (5 มาตรฐาน)</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full w-[25%]" />
          </div>
          <span className="mt-2 block text-[11px] text-slate-400">สถานะ: อยู่ระหว่างรวบรวมหลักฐาน</span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">ไฟล์หลักฐานในระบบ</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <FolderArchive className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">0</span>
            <span className="text-xs text-slate-500 font-medium">ไฟล์ที่อัปโหลด</span>
          </div>
          <div className="mt-4 text-xs text-purple-600 font-semibold flex items-center gap-1">
            <Link href="/evidence" className="flex items-center gap-1 hover:underline">
              ไปยังคลังเอกสารหลักฐาน <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">สถานะเล่ม SAR</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-xl font-bold text-amber-600">ฉบับร่าง (Draft)</span>
          </div>
          <span className="mt-3 block text-xs text-slate-500">
            กำหนดส่งภายในสิ้นภาคเรียนการศึกษา
          </span>
        </div>
      </div>

      {/* Standards Summary List */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">มาตรฐานการประกันคุณภาพการศึกษา สอศ.</h2>
          <p className="text-xs text-slate-500">เลือกดูและบันทึกข้อมูลการประเมินตนเองตามมาตรฐาน</p>
        </div>

        <div className="space-y-3 pt-2">
          {standards.map((std) => (
            <div
              key={std.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50/50 p-4 transition hover:bg-blue-50/30 hover:border-blue-200 gap-3"
            >
              <div className="flex items-start sm:items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-blue-600 font-bold text-sm shadow-2xs flex-shrink-0">
                  {std.standardNumber}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{std.title}</h4>
                  <span className="text-xs text-slate-500 font-medium">
                    ค่าน้ำหนัก {std.weight}% • {std.indicators.length} ตัวบ่งชี้
                  </span>
                </div>
              </div>

              <Link
                href="/indicators"
                className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition"
              >
                ดูตัวบ่งชี้ <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
