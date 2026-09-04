"use client";

import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  CheckSquare,
  Trophy,
  Calendar,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Award,
  BookOpen,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useAcademicYear } from "@/components/layout/AcademicYearContext";

export default function StudentDashboardPage() {
  const { selectedYear, selectedSemester, termLabel } = useAcademicYear();

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* 1. Top Breadcrumb with Unified Back Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-blue-600 text-xs font-bold transition shadow-2xs group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span>← กลับหน้าหลัก (ภาพรวมงานครู)</span>
        </Link>

        {/* Term Badge Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200/80 text-xs text-blue-800 font-bold">
          <Calendar className="h-3.5 w-3.5 text-blue-600" />
          <span>ข้อมูลประจำ: {termLabel}</span>
        </div>
      </div>

      {/* 2. Hero Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl shadow-slate-200">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-bold text-blue-200">
            <GraduationCap className="h-3.5 w-3.5 text-blue-300" />
            มาตรฐานที่ 1 คุณภาพของผู้สำเร็จการศึกษาอาชีวศึกษา (SAR สอศ.)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            ภาพรวมงานนักเรียนและนักศึกษา
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            ศูนย์กลางการติดตามผลสัมฤทธิ์ทางการเรียน สถิติการเข้าเรียน สมรรถนะวิชาชีพ และกิจกรรมผู้เรียน
            ประจำ {termLabel} เชื่อมโยงข้อมูลตรงระหว่างครูผู้สอน ครูที่ปรึกษา และงานทะเบียน
          </p>
        </div>

        {/* Background graphic decoration */}
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* 3. SAR KPI Cards (ตามเกณฑ์มาตรฐาน สอศ.) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              ปวช. / ปวส.
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">1,248 คน</div>
          <div className="text-xs font-bold text-slate-500 mt-1">
            นักเรียน-นักศึกษาลงทะเบียน
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-2 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> อัตราคงอยู่ 98.4% (สูงกว่าเกณฑ์)
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckSquare className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
              รายคาบ/วัน
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">92.6%</div>
          <div className="text-xs font-bold text-slate-500 mt-1">
            อัตราการเข้าชั้นเรียนเฉลี่ย
          </div>
          <div className="text-[11px] text-slate-400 font-semibold mt-2">
            บันทึกโดยครูผู้สอน 100%
          </div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-600">
              <Trophy className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
              มาตรฐานฝีมือ
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">89.2%</div>
          <div className="text-xs font-bold text-slate-500 mt-1">
            ผ่านการประเมินสมรรถนะวิชาชีพ
          </div>
          <div className="text-[11px] text-purple-600 font-semibold mt-2">
            TPQI / DSD / สภาวิศวกร
          </div>
        </div>

        {/* Metric 4 */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600">
              <Award className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
              กิจกรรมหน้าเสาธง
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">95.1%</div>
          <div className="text-xs font-bold text-slate-500 mt-1">
            เข้าร่วมกิจกรรมพัฒนาผู้เรียน
          </div>
          <div className="text-[11px] text-amber-600 font-semibold mt-2">
            ผ่านเกณฑ์กิจกรรมชมรม & จิตอาสา
          </div>
        </div>
      </div>

      {/* 4. Quick Navigation Cards to Student Modules */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              โมดูลระบบงานนักเรียน (เชื่อมโยงกับครูผู้สอน)
            </h3>
            <p className="text-xs text-slate-400">
              ระบบบันทึกและรวบรวมหลักฐานร่องรอยเพื่อนำเข้าเล่มรายงานการประเมินตนเอง (SAR)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            href="/students"
            className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-blue-50/60 hover:border-blue-200 transition group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-xl bg-white text-blue-600 shadow-2xs border border-slate-100">
                <Users className="h-4 w-4" />
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                ทะเบียนข้อมูลนักเรียน
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                ฐานข้อมูลประวัติและสถานะนักศึกษา
              </div>
            </div>
          </Link>

          <Link
            href="/students/attendance"
            className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-emerald-50/60 hover:border-emerald-200 transition group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-xl bg-white text-emerald-600 shadow-2xs border border-slate-100">
                <CheckSquare className="h-4 w-4" />
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                เช็คชื่อ & พฤติกรรม
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                บันทึกการเข้าเรียนรายคาบและพฤติกรรม
              </div>
            </div>
          </Link>

          <Link
            href="/students/competencies"
            className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-purple-50/60 hover:border-purple-200 transition group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-xl bg-white text-purple-600 shadow-2xs border border-slate-100">
                <Trophy className="h-4 w-4" />
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-0.5 transition" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-purple-700">
                ผลสัมฤทธิ์ & สมรรถนะ
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                เกรดเฉลี่ย, V-NET และใบรับรองทักษะ
              </div>
            </div>
          </Link>

          <Link
            href="/students/activities"
            className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-amber-50/60 hover:border-amber-200 transition group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-xl bg-white text-amber-600 shadow-2xs border border-slate-100">
                <Award className="h-4 w-4" />
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-amber-700">
                กิจกรรมผู้เรียน & ชมรม
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                เช็คชื่อหน้าเสาธงและชมรมวิชาชีพ
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
