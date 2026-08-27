"use client";

import React, { useState, useMemo } from "react";
import { Activity, Clock, CheckCircle2 } from "lucide-react";
import { clsx } from "clsx";

interface DayData {
  date: string; // YYYY-MM-DD
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface RecentActivity {
  id: string;
  action: string;
  title: string;
  createdAt: string;
}

export function ContributionGraph({
  totalContributions = 0,
  contributionMap = {},
  recentActivities = [],
}: {
  totalContributions?: number;
  contributionMap?: Record<string, number>;
  recentActivities?: RecentActivity[];
}) {
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  // Generate exact 52 weeks (364 days) leading up to today
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

      // STRICTLY USE REAL DATABASE DATA (0 if no activity recorded)
      const count = contributionMap[dateStr] || 0;
      countSum += count;

      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (count >= 6) level = 4;
      else if (count >= 4) level = 3;
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
      totalCount: countSum > 0 ? countSum : totalContributions,
    };
  }, [contributionMap, totalContributions]);

  const getCellColor = (level: number) => {
    switch (level) {
      case 1:
        return "bg-emerald-300 hover:ring-2 hover:ring-emerald-400";
      case 2:
        return "bg-emerald-500 hover:ring-2 hover:ring-emerald-600";
      case 3:
        return "bg-emerald-600 hover:ring-2 hover:ring-emerald-700";
      case 4:
        return "bg-emerald-800 hover:ring-2 hover:ring-emerald-900";
      default:
        return "bg-slate-100 hover:bg-slate-200";
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/70 flex-shrink-0 shadow-2xs">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              กิจกรรมและการมีส่วนร่วม (Contribution Activity)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              <strong className="text-emerald-700 font-bold">{totalCount} กิจกรรมจริง</strong> บันทึกจากระบบในรอบ 1 ปีที่ผ่านมา
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 self-start sm:self-auto">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          เชื่อมโยงระบบฐานข้อมูลจริง (PostgreSQL)
        </div>
      </div>

      {/* Heatmap Grid (Scrollable on small screens) */}
      <div className="relative overflow-x-auto pb-2 pt-1">
        <div className="inline-block min-w-[760px]">
          {/* Month Labels */}
          <div className="flex text-[11px] text-slate-400 font-medium pl-8 mb-1.5 relative h-4">
            {monthLabels.map((m, idx) => (
              <span
                key={idx}
                className="absolute"
                style={{ left: `${m.weekIndex * 14 + 32}px` }}
              >
                {m.label}
              </span>
            ))}
          </div>

          {/* Grid Container */}
          <div className="flex gap-2">
            {/* Day Labels (Mon, Wed, Fri) */}
            <div className="flex flex-col justify-between text-[10px] text-slate-400 font-semibold pr-2 py-0.5 h-[96px] select-none">
              <span>จันทร์</span>
              <span>พุธ</span>
              <span>ศุกร์</span>
            </div>

            {/* Weeks columns */}
            <div className="flex gap-[3.5px]">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-[3.5px]">
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
                        "h-[11px] w-[11px] rounded-[3px] transition-all cursor-pointer",
                        getCellColor(day.level)
                      )}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Footer / Legend */}
          <div className="flex items-center justify-between pt-3 text-[11px] text-slate-500 border-t border-slate-100 mt-4">
            <span className="text-slate-400 text-xs">
              * บันทึกกิจกรรมอัตโนมัติเมื่อมีการอัปเดตข้อมูล, อัปโหลดเอกสาร SAR หรือประเมินคุณภาพ
            </span>

            <div className="flex items-center gap-1.5 font-medium text-slate-500">
              <span>น้อย</span>
              <span className="h-3 w-3 rounded-[3px] bg-slate-100 inline-block border border-slate-200" title="0 กิจกรรม" />
              <span className="h-3 w-3 rounded-[3px] bg-emerald-300 inline-block" title="1 กิจกรรม" />
              <span className="h-3 w-3 rounded-[3px] bg-emerald-500 inline-block" title="2-3 กิจกรรม" />
              <span className="h-3 w-3 rounded-[3px] bg-emerald-600 inline-block" title="4-5 กิจกรรม" />
              <span className="h-3 w-3 rounded-[3px] bg-emerald-800 inline-block" title="6+ กิจกรรม" />
              <span>มาก</span>
            </div>
          </div>
        </div>

        {/* Hover Tooltip */}
        {hoveredDay && (
          <div
            className="fixed z-50 -translate-x-1/2 -translate-y-full px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-medium shadow-xl pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-100"
            style={{ left: hoveredDay.x, top: hoveredDay.y }}
          >
            <strong>{hoveredDay.count} กิจกรรม</strong> ในวันที่{" "}
            {new Date(hoveredDay.date).toLocaleDateString("th-TH", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        )}
      </div>

      {/* Recent Activity Log List */}
      {recentActivities.length > 0 && (
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            ประวัติกิจกรรมล่าสุดในระบบ (Recent Activity Logs):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {recentActivities.map((act) => (
              <div
                key={act.id}
                className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700"
              >
                <div className="flex items-center gap-2 truncate">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                  <span className="font-semibold truncate">{act.title}</span>
                </div>
                <span className="text-[10px] text-slate-400 flex items-center gap-1 flex-shrink-0">
                  <Clock className="h-3 w-3" />
                  {new Date(act.createdAt).toLocaleDateString("th-TH", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
