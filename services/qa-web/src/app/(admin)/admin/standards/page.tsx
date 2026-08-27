import React from "react";
import { prisma } from "@/lib/prisma";
import { Award, CheckCircle, Scale, Star, FileText } from "lucide-react";

export default async function AdminStandardsPage() {
  const standards = await prisma.standard.findMany({
    include: {
      indicators: {
        orderBy: { indicatorCode: "asc" },
      },
    },
    orderBy: { standardNumber: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
          <Award className="h-7 w-7 text-purple-600" />
          เกณฑ์มาตรฐานและตัวบ่งชี้การประกันคุณภาพ (สอศ.)
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          มาตรฐานการศึกษาของสำนักงานคณะกรรมการการอาชีวศึกษา (5 มาตรฐาน 21 ตัวบ่งชี้)
        </p>
      </div>

      <div className="space-y-6">
        {standards.map((std) => (
          <div
            key={std.id}
            className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-700 font-bold text-sm border border-purple-200">
                  {std.standardNumber}
                </span>
                <h3 className="text-base font-bold text-slate-900">{std.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  <Scale className="h-3.5 w-3.5 text-slate-500" />
                  ค่าน้ำหนัก: {std.weight}%
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 border border-purple-200">
                  {std.indicators.length} ตัวบ่งชี้
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {std.indicators.map((ind) => (
                <div
                  key={ind.id}
                  className="rounded-xl border border-slate-200/70 bg-slate-50/50 p-4 transition hover:bg-purple-50/20 hover:border-purple-200"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white border border-slate-200 font-bold text-xs text-purple-700 shadow-2xs">
                        {ind.indicatorCode}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{ind.title}</h4>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 flex-shrink-0">
                      คะแนนเต็ม {ind.maxScore}
                    </span>
                  </div>
                  {ind.criteria && (
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed bg-white/60 p-2.5 rounded-lg border border-slate-100">
                      <span className="font-semibold text-slate-700">เกณฑ์: </span>
                      {ind.criteria}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
