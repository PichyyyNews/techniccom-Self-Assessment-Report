"use client";

import React from "react";
import Link from "next/link";
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
          มาตรฐานที่ 1 ด้านคุณธรรม จริยธรรม และค่านิยมที่พึงประสงค์ (วินัยและความรับผิดชอบ)
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              บันทึกการเข้าเรียน & พฤติกรรม
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-1 leading-relaxed">
              ระบบบันทึกเวลาเรียนรายคาบโดยครูผู้สอน และบันทึกพฤติกรรมการมาเรียนรายวัน เพื่อใช้ประเมินเวลาเรียน 80% และเกณฑ์ SAR คุณลักษณะผู้เรียน
            </p>
          </div>
          <button
            type="button"
            onClick={() => alert("ระบบฟอร์มบันทึกข้อมูลจะเชื่อมต่อกับฐานข้อมูลในเฟสถัดไป")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-200 transition active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>+ บันทึกเช็คชื่อคาบเรียนวันนี้</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">สถิติการมาเรียนเฉลี่ย</div>
          <div className="text-2xl font-black text-slate-900 mt-1">92.6%</div>
          <div className="text-xs font-semibold text-emerald-600 mt-1">คำนวณจากรายวิชาที่เปิดสอน</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">ผ่านเกณฑ์เวลาเรียน 80%</div>
          <div className="text-2xl font-black text-slate-900 mt-1">99.1%</div>
          <div className="text-xs font-semibold text-blue-600 mt-1">มีสิทธิ์เข้าสอบปลายภาค</div>
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
                <th className="py-3 px-4 text-left font-bold text-slate-500">รหัสวิชา / รายวิชา</th><th className="py-3 px-4 text-left font-bold text-slate-500">กลุ่มเรียน</th><th className="py-3 px-4 text-left font-bold text-slate-500">จำนวนคาบสอน</th><th className="py-3 px-4 text-left font-bold text-slate-500">สถิติการมาเรียน</th><th className="py-3 px-4 text-left font-bold text-slate-500">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              
                <tr className="border-b border-slate-100 hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 text-xs font-bold text-slate-800">20105-2001 การเขียนโปรแกรม</td>
                  <td className="py-3 px-4 text-xs text-slate-600">ปวช.2 ช่างเทคนิคคอมฯ (กลุ่ม 1)</td>
                  <td className="py-3 px-4 text-xs text-slate-600">64 คาบ</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      94.2% (ดีมาก)
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="text-xs font-bold text-blue-600 hover:text-blue-800">
                      ดูรายละเอียด
                    </button>
                  </td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 text-xs font-bold text-slate-800">30105-2003 ระบบเครือข่าย</td>
                  <td className="py-3 px-4 text-xs text-slate-600">ปวส.1 เทคโนโลยีสารสนเทศ</td>
                  <td className="py-3 px-4 text-xs text-slate-600">80 คาบ</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      91.8% (ดี)
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="text-xs font-bold text-blue-600 hover:text-blue-800">
                      ดูรายละเอียด
                    </button>
                  </td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 text-xs font-bold text-slate-800">20105-2104 งานซ่อมไมโครคอมฯ</td>
                  <td className="py-3 px-4 text-xs text-slate-600">ปวช.3 ช่างเทคนิคคอมฯ (กลุ่ม 2)</td>
                  <td className="py-3 px-4 text-xs text-slate-600">48 คาบ</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      93.5% (ดีมาก)
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
