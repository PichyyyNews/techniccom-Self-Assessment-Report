import React from "react";
import { prisma } from "@/lib/prisma";
import { Calendar, CheckCircle2, Clock, Plus } from "lucide-react";

export default async function AcademicYearsPage() {
  const years = await prisma.academicYear.findMany({
    include: {
      _count: {
        select: { standards: true, sarReports: true },
      },
    },
    orderBy: { year: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Calendar className="h-7 w-7 text-emerald-600" />
            รอบปีการศึกษาและรอบการประเมิน (Academic Years)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            กำหนดรอบปีการศึกษา เปิด/ปิดการส่งเล่มรายงาน SAR และควบคุมสถานะการประเมิน
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {years.map((y) => (
          <div
            key={y.id}
            className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4 transition hover:border-emerald-300"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-slate-900">ปีการศึกษา {y.year}</span>
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                  y.isActive
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {y.isActive ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    กำลังเปิดรับผลงาน
                  </>
                ) : (
                  "ปิดรอบประเมินแล้ว"
                )}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex justify-between">
                <span>จำนวนมาตรฐานที่ใช้:</span>
                <span className="font-bold text-slate-800">{y._count.standards} มาตรฐาน</span>
              </div>
              <div className="flex justify-between">
                <span>รายงาน SAR ที่จัดทำ:</span>
                <span className="font-bold text-slate-800">{y._count.sarReports} ฉบับ</span>
              </div>
              <div className="flex justify-between">
                <span>ช่วงเวลาเริ่ม-สิ้นสุด:</span>
                <span className="font-medium text-slate-500">
                  {y.startDate ? new Date(y.startDate).toLocaleDateString("th-TH") : "15 พ.ค."} -{" "}
                  {y.endDate ? new Date(y.endDate).toLocaleDateString("th-TH") : "30 เม.ย."}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
