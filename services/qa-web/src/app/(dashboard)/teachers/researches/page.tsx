"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Sparkles,
  BookOpen,
  Award,
  Lightbulb,
  CheckCircle2,
  Plus,
  FileText,
  Clock,
} from "lucide-react";
import { useAcademicYear } from "@/components/layout/AcademicYearContext";

export default function Page() {
  const { termLabel } = useAcademicYear();

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Navigation with Back Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-blue-600 text-xs font-bold transition shadow-2xs group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span>← กลับหน้าหลัก (ภาพรวมงานครู)</span>
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
          มาตรฐานที่ 3 การสร้างสังคมแห่งการเรียนรู้ (ด้านนวัตกรรม สิ่งประดิษฐ์ และงานวิจัย)
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              งานวิจัย นวัตกรรม & สิ่งประดิษฐ์
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-1 leading-relaxed">
              ฐานข้อมูลงานวิจัยในชั้นเรียน นวัตกรรมการเรียนรู้ และสิ่งประดิษฐ์ของคนรุ่นใหม่ร่วมกับนักศึกษา เพื่อยกระดับคุณภาพการจัดการศึกษา
            </p>
          </div>
          <button
            type="button"
            onClick={() => alert("ระบบฟอร์มบันทึกข้อมูลจะเชื่อมต่อกับฐานข้อมูลในเฟสถัดไป")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-200 transition active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>+ เพิ่มงานวิจัย / สิ่งประดิษฐ์</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">งานวิจัยในชั้นเรียน</div>
          <div className="text-2xl font-black text-slate-900 mt-1">3 ผลงาน</div>
          <div className="text-xs font-semibold text-emerald-600 mt-1">เสร็จสิ้นตามปีการศึกษา</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">การประกวดสิ่งประดิษฐ์</div>
          <div className="text-2xl font-black text-slate-900 mt-1">1 รางวัล</div>
          <div className="text-xs font-semibold text-blue-600 mt-1">ระดับภาค / ระดับชาติ</div>
        </div>
      </div>

      {/* Data Table Preview */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="text-sm font-bold text-slate-800">
            รายการบันทึกข้อมูลประจำ {termLabel}
          </div>
          <span className="text-xs text-slate-400 font-semibold">แสดงรายการตัวอย่าง</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 text-left font-bold text-slate-500">ชื่อผลงานวิจัย / สิ่งประดิษฐ์</th><th className="py-3 px-4 text-left font-bold text-slate-500">ประเภทผลงาน</th><th className="py-3 px-4 text-left font-bold text-slate-500">นักศึกษาร่วมทีม</th><th className="py-3 px-4 text-left font-bold text-slate-500">สถานะผลงาน</th><th className="py-3 px-4 text-left font-bold text-slate-500">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              
                <tr className="border-b border-slate-100 hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 text-xs font-bold text-slate-800">การพัฒนาชุดทดลอง IoT สำหรับการเรียนรู้ระบบสมองกลฝังตัว</td>
                  <td className="py-3 px-4 text-xs text-slate-600">นวัตกรรมการสอน / สิ่งประดิษฐ์</td>
                  <td className="py-3 px-4 text-xs text-slate-600">นักศึกษา ปวส.2 (3 คน)</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      เผยแพร่แล้ว
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="text-xs font-bold text-blue-600 hover:text-blue-800">
                      ดูรายละเอียด
                    </button>
                  </td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 text-xs font-bold text-slate-800">การแก้ปัญหาทักษะการเขียนโปรแกรมเชิงวัตถุด้วยกระบวนการ Project-Based</td>
                  <td className="py-3 px-4 text-xs text-slate-600">วิจัยในชั้นเรียน (Action Research)</td>
                  <td className="py-3 px-4 text-xs text-slate-600">นักเรียน ปวช.2</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      เล่มสมบูรณ์
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="text-xs font-bold text-blue-600 hover:text-blue-800">
                      ดูรายละเอียด
                    </button>
                  </td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 text-xs font-bold text-slate-800">ระบบตรวจสอบสถานะเครื่องจักรในโรงฝึกงานผ่าน Mobile Dashboard</td>
                  <td className="py-3 px-4 text-xs text-slate-600">สิ่งประดิษฐ์คนรุ่นใหม่</td>
                  <td className="py-3 px-4 text-xs text-slate-600">นักศึกษา ปวส.1 (4 คน)</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ส่งเข้าประกวด
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="text-xs font-bold text-blue-600 hover:text-blue-800">
                      ดูรายละเอียด
                    </button>
                  </td>
                </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
