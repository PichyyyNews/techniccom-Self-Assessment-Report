"use client";

import React, { useState, useMemo } from "react";
import { Sparkles, Calendar, Activity } from "lucide-react";
import { clsx } from "clsx";

interface DayData {
  date: string; // YYYY-MM-DD
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export function ContributionGraph({
  totalContributions = 42,
  data,
}: {
  totalContributions?: number;
  data?: Record<string, number>;
}) {
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  // Generate 52 weeks (364 days) leading up to today
  const { weeks, monthLabels, totalCount } = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon ...
    const totalDays = 52 * 7 + dayOfWeek;
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - totalDays + 1);

    const generatedWeeks: DayData[][] = [];
    const months: { label: string; weekIndex: number }[] = [];
    let currentMonth = -1;
    let countSum = 0;

    let currentWeek: DayData[] = [];

    // Helper random activity generator (if no custom data provided)
    const getSampleCount = (dStr: string) => {
      if (data && data[dStr] !== undefined) return data[dStr];
      // Seeded determinism based on date hash
      const hash = dStr.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
      if (hash % 11 === 0) return (hash % 4) + 1;
      if (hash % 19 === 0) return (hash % 6) + 2;
      return 0;
    };

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];

      const month = d.getMonth();
      const weekIdx = Math.floor(i / 7);

      if (month !== currentMonth && d.getDate() <= 7) {
        currentMonth = month;
        const monthNames = [
          "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
          "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
        ];
        months.push({ label: monthNames[month], weekIndex: weekIdx });
      }

      const count = getSampleCount(dateStr);
      countSum += count;

      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (count >= 5) level = 4;
      else if (count >= 3) level = 3;
      else if (count >= 2) level = 2;
      else if (count >= 1) level = 1;

      currentWeek.push({
        date: dateStr,
        count,
        level,
      });

      if (currentWeek.length === 7) {
        generatedWeeks.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      generatedWeeks.push(currentWeek);
    }

    return {
      weeks: generatedWeeks,
      monthLabels: months,
      totalCount: countSum || totalContributions,
    };
  }, [data, totalContributions]);

  const getCellColor = (level: number) => {
    switch (level) {
      case 1:
        return "bg-emerald-200 hover:ring-2 hover:ring-emerald-300";
      case 2:
        return "bg-emerald-400 hover:ring-2 hover:ring-emerald-500";
      case 3:
        return "bg-emerald-600 hover:ring-2 hover:ring-emerald-700";
      case 4:
        return "bg-emerald-800 hover:ring-2 hover:ring-emerald-900";
      default:
        return "bg-slate-100 hover:bg-slate-200";
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex-shrink-0">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              กิจกรรมและการมีส่วนร่วม (Contribution Activity)
            </h3>
            <p className="text-xs text-slate-500">
              <strong className="text-emerald-700 font-bold">{totalCount} กิจกรรม</strong> ในรอบ 1 ปีที่ผ่านมา
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="hidden sm:inline">การประเมิน SAR & ข้อมูลระบบ</span>
        </div>
      </div>

      {/* Heatmap Grid (Scrollable on small screens) */}
      <div className="relative overflow-x-auto pb-2 pt-1">
        <div className="inline-block min-w-[720px]">
          {/* Month Labels */}
          <div className="flex text-[10px] text-slate-400 font-medium pl-8 mb-1 relative h-4">
            {monthLabels.map((m, idx) => (
              <span
                key={idx}
                className="absolute"
                style={{ left: `${m.weekIndex * 13 + 32}px` }}
              >
                {m.label}
              </span>
            ))}
          </div>

          {/* Grid Container */}
          <div className="flex gap-1.5">
            {/* Day Labels (Mon, Wed, Fri) */}
            <div className="flex flex-col justify-between text-[9px] text-slate-400 font-semibold pr-1.5 py-0.5 h-[88px] select-none">
              <span>จ.</span>
              <span>พ.</span>
              <span>ศ.</span>
            </div>

            {/* Weeks columns */}
            <div className="flex gap-[3px]">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-[3px]">
                  {week.map((day, dIdx) => (
                    <div
                      key={dIdx}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredDay({
                          date: day.date,
                          count: day.count,
                          x: rect.left + rect.width / 2,
                          y: rect.top - 8,
                        });
                      }}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={clsx(
                        "h-[10px] w-[10px] sm:h-[11px] sm:w-[11px] rounded-[2px] transition-all cursor-pointer",
                        getCellColor(day.level)
                      )}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Footer / Legend */}
          <div className="flex items-center justify-between pt-3 text-[11px] text-slate-400 border-t border-slate-100 mt-3">
            <span className="text-slate-400">
              * ข้อมูลจะเชื่อมโยงกับการอัปโหลดเอกสาร SAR และประเมินผล
            </span>

            <div className="flex items-center gap-1.5 font-medium">
              <span>น้อย</span>
              <span className="h-2.5 w-2.5 rounded-[2px] bg-slate-100 inline-block border border-slate-200/50" />
              <span className="h-2.5 w-2.5 rounded-[2px] bg-emerald-200 inline-block" />
              <span className="h-2.5 w-2.5 rounded-[2px] bg-emerald-400 inline-block" />
              <span className="h-2.5 w-2.5 rounded-[2px] bg-emerald-600 inline-block" />
              <span className="h-2.5 w-2.5 rounded-[2px] bg-emerald-800 inline-block" />
              <span>มาก</span>
            </div>
          </div>
        </div>

        {/* Hover Tooltip */}
        {hoveredDay && (
          <div
            className="fixed z-50 -translate-x-1/2 -translate-y-full px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-medium shadow-xl pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-100"
            style={{ left: hoveredDay.x, top: hoveredDay.y }}
          >
            <strong>{hoveredDay.count} กิจกรรม</strong> เมื่อ{" "}
            {new Date(hoveredDay.date).toLocaleDateString("th-TH", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        )}
      </div>
    </div>
  );
}
