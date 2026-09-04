"use client";

import React, { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface DayData {
  date: string;
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
  const { weeks, monthLabels, totalCount } = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
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

  const totalWeeksCount = weeks.length || 52;

  const getCellColor = (level: number) => {
    switch (level) {
      case 1:
        return "#86efac";
      case 2:
        return "#22c55e";
      case 3:
        return "#16a34a";
      case 4:
        return "#15803d";
      default:
        return "#f1f5f9";
    }
  };

  return (
    <Paper sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1.25 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          pb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              display: "flex",
              width: 30,
              height: 30,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 1.5,
              bgcolor: "success.50",
              color: "success.main",
              border: "1px solid",
              borderColor: "success.light",
              flexShrink: 0,
            }}
          >
            <ShowChartIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>กิจกรรมและการมีส่วนร่วม</Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", display: { xs: "none", sm: "inline" } }}>
              <strong style={{ color: "#16a34a" }}>{totalCount} รายการ</strong> ในรอบ 1 ปี
            </Typography>
          </Box>
        </Box>

        <Chip
          size="small"
          label="ข้อมูลจริง"
          color="success"
          variant="outlined"
          sx={{ height: 20, fontSize: "0.6875rem" }}
        />
      </Box>

      {/* Heatmap Grid Wrapper */}
      <Box sx={{ overflowX: "auto", pb: 1, pt: 0.5 }}>
        <Box sx={{ minWidth: 680 }}>
          {/* Month Labels */}
          <Box sx={{ position: "relative", height: 20, pl: 5, mb: 0.5 }}>
            {monthLabels.map((m, idx) => (
              <Typography
                key={idx}
                variant="caption"
                sx={{
                  position: "absolute",
                  left: `calc(2.5rem + ${(m.weekIndex / totalWeeksCount) * 100}%)`,
                  color: "text.secondary",
                  fontWeight: 500,
                  fontSize: "0.6875rem",
                }}
              >
                {m.label}
              </Typography>
            ))}
          </Box>

          {/* Grid Container */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
            {/* Day Labels */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                width: 32,
                pr: 0.5,
                py: 0.5,
                height: 104,
                userSelect: "none",
                flexShrink: 0,
              }}
            >
              <Typography variant="caption" sx={{ fontSize: "0.625rem", color: "text.secondary" }}>
                จันทร์
              </Typography>
              <Typography variant="caption" sx={{ fontSize: "0.625rem", color: "text.secondary" }}>
                พุธ
              </Typography>
              <Typography variant="caption" sx={{ fontSize: "0.625rem", color: "text.secondary" }}>
                ศุกร์
              </Typography>
            </Box>

            {/* Weeks columns */}
            <Box sx={{ flex: 1, display: "flex", gap: "3px", justifyContent: "space-between" }}>
              {weeks.map((week, wIdx) => (
                <Box key={wIdx} sx={{ flex: 1, display: "flex", flexDirection: "column", gap: "3px" }}>
                  {week.map((day, dIdx) => (
                    <Tooltip
                      key={dIdx}
                      title={`${day.date} มี ${day.count} กิจกรรม`}
                      arrow
                      placement="top"
                    >
                      <Box
                        sx={{
                          width: "100%",
                          aspectRatio: "1/1",
                          borderRadius: "2px",
                          bgcolor: getCellColor(day.level),
                          cursor: "pointer",
                          transition: "opacity 0.1s",
                          "&:hover": { opacity: 0.8 },
                        }}
                      />
                    </Tooltip>
                  ))}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Bottom Footer / Legend */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
              gap: 1,
              pt: 2,
              mt: 1.5,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              บันทึกกิจกรรมอัตโนมัติเมื่อมีการอัปเดตข้อมูล หรือจัดเก็บเอกสาร
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>น้อย</Typography>
              <Box sx={{ width: 10, height: 10, borderRadius: "2px", bgcolor: "#f1f5f9", border: "1px solid #e2e8f0" }} />
              <Box sx={{ width: 10, height: 10, borderRadius: "2px", bgcolor: "#86efac" }} />
              <Box sx={{ width: 10, height: 10, borderRadius: "2px", bgcolor: "#22c55e" }} />
              <Box sx={{ width: 10, height: 10, borderRadius: "2px", bgcolor: "#16a34a" }} />
              <Box sx={{ width: 10, height: 10, borderRadius: "2px", bgcolor: "#15803d" }} />
              <Typography variant="caption" sx={{ color: "text.secondary" }}>มาก</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Recent Activity Log List */}
      {recentActivities && recentActivities.length > 0 && (
        <Box sx={{ pt: 1, borderTop: "1px solid", borderColor: "divider" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <AccessTimeIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography variant="subtitle2">
              ประวัติกิจกรรมล่าสุด
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {recentActivities.slice(0, 5).map((act) => (
              <Box
                key={act.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1.25,
                  borderRadius: 2,
                  bgcolor: "background.default",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CheckCircleIcon sx={{ fontSize: 16, color: "success.main" }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {act.title}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {new Date(act.createdAt).toLocaleDateString("th-TH")}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
}
