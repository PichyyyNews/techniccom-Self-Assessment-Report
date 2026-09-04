"use client";

import React from "react";
import Link from "next/link";
import { LiveEvidenceSection } from "@/components/evidence/LiveEvidenceSection";
import {
  ArrowLeft,
  Calendar,
  Sparkles,
  Users,
  CheckSquare,
  Trophy,
  Award,
  Plus,
  GraduationCap,
} from "lucide-react";
import { useAcademicYear } from "@/components/layout/AcademicYearContext";

export default function StudentSubPage() {
  const { termLabel } = useAcademicYear();

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Navigation with Back Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/students"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-blue-600 text-xs font-bold transition shadow-2xs group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span>← กลับหน้าภาพรวมงานนักเรียน</span>
        </Link>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200/80 text-xs text-blue-800 font-bold">
          <Calendar className="h-3.5 w-3.5 text-blue-600" />
          <span>รอบข้อมูล: {termLabel}</span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
          มาตรฐานที่ 1 ด้านความรู้และทักษะทางวิชาชีพ (ผลสัมฤทธิ์ V-NET และมาตรฐานฝีมือ)
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              ผลสัมฤทธิ์ทางการเรียน & สมรรถนะวิชาชีพ
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-1 leading-relaxed">
              ศูนย์รวมคะแนนผลสัมฤทธิ์ทางการเรียน (GPAX), ผลการทดสอบระดับชาติด้านอาชีวศึกษา (V-NET) และการประเมินมาตรฐานวิชาชีพ TPQI/DSD
            </p>
          </div>
          <Link href="/quick-upload" className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-200 transition active:scale-95"><Plus className="h-4 w-4" /><span>+ บันทึกผลการประเมินสมรรถนะ</span></Link>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">เกรดเฉลี่ยสะสม (GPAX เฉลี่ย)</div>
          <div className="text-2xl font-black text-slate-900 mt-1">3.18</div>
          <div className="text-xs font-semibold text-emerald-600 mt-1">เพิ่มขึ้น 0.12 จากปีก่อนหน้า</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">ผ่านประเมินมาตรฐานวิชาชีพ</div>
          <div className="text-2xl font-black text-slate-900 mt-1">89.2%</div>
          <div className="text-xs font-semibold text-blue-600 mt-1">ผ่านเกณฑ์ระดับ 1-3</div>
        </div>
      </div>

      {/* Live Uploaded Evidence Files */}
      <LiveEvidenceSection category="student_work" sectionTitle="หลักฐานชิ้นงานและผลงานนักศึกษา (Live Student Artifacts)" emptyNotice="ยังไม่มีการอัปโหลดชิ้นงานนักศึกษาในรอบปีการศึกษานี้" />
    </div>
  );
}
