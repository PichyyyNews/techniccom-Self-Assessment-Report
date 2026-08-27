import React from "react";
import { prisma } from "@/lib/prisma";
import { CheckSquare, Upload, Star, ChevronRight, FileCheck } from "lucide-react";
import Link from "next/link";

export default async function IndicatorsPage() {
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
          <CheckSquare className="h-7 w-7 text-blue-600" />
          ตัวบ่งชี้และบันทึกคะแนนการประเมินตนเอง
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          บันทึกผลการดำเนินงาน แนบไฟล์หลักฐาน และประเมินคะแนนตนเอง (คะแนนเต็ม 5.0)
        </p>
      </div>

      <div className="space-y-6">
        {standards.map((std) => (
          <div
            key={std.id}
            className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700 font-bold text-sm border border-blue-200">
                  {std.standardNumber}
                </span>
                <h3 className="text-base font-bold text-slate-900">{std.title}</h3>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                ค่าน้ำหนัก {std.weight}%
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {std.indicators.map((ind) => (
                <div key={ind.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-50 font-bold text-xs text-blue-700 border border-blue-200">
                        ตัวบ่งชี้ {ind.indicatorCode}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{ind.title}</h4>
                    </div>
                    {ind.criteria && (
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {ind.criteria}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block font-medium">คะแนนประเมิน</span>
                      <span className="text-sm font-bold text-slate-700">- / {ind.maxScore}</span>
                    </div>

                    <Link
                      href={`/evidence?indicator=${ind.indicatorCode}`}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-600 transition"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      แนบหลักฐาน
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
