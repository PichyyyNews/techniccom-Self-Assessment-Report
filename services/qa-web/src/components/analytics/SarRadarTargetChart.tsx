"use client";

import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import SchoolIcon from "@mui/icons-material/School";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";

interface SarStandardMetric {
  standard: string;
  target: number;
  actual: number;
  unit: string;
}

interface LicenseItem {
  status: string;
  count: number;
  color: string;
}

interface QualificationItem {
  degree: string;
  count: number;
}

interface AcademicRankItem {
  rank: string;
  count: number;
}

interface SarRadarTargetChartProps {
  metrics: SarStandardMetric[];
  licenses: LicenseItem[];
  qualifications?: QualificationItem[];
  academicRanks?: AcademicRankItem[];
}

export function SarRadarTargetChart({
  metrics,
  licenses,
  qualifications = [],
  academicRanks = [],
}: SarRadarTargetChartProps) {
  const chartData = metrics.map((m) => ({
    standard: m.standard,
    เป้าหมาย: m.target,
    ผลประเมินจริง: m.actual,
  }));

  const pieData = licenses.map((l, idx) => ({
    id: idx,
    value: l.count,
    label: l.status,
    color: l.color,
  }));

  const rankChartData = academicRanks.map((r) => ({
    rank: r.rank,
    จำนวน: r.count,
  }));

  const qualChartData = qualifications.map((q) => ({
    degree: q.degree,
    จำนวน: q.count,
  }));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Row 1: Target vs Actual & License Risk Horizon */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "2fr 1.2fr" }, gap: { xs: 1.5, sm: 2 } }}>
        {/* 1. Target vs Actual Bar Chart */}
        <Paper sx={{ p: { xs: 1.5, sm: 2 }, border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, gap: 1, mb: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <TrackChangesIcon sx={{ fontSize: 20, color: "primary.main" }} />
              <Box>
                <Typography variant="h3" sx={{ fontSize: "0.95rem", fontWeight: 700 }}>
                  การประเมินความพร้อม SAR 3 มาตรฐาน (Target vs Actual)
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  เปรียบเทียบค่าเป้าหมายของแผนก กับผลการดำเนินงานจริงที่ระบบรวบรวมได้
                </Typography>
              </Box>
            </Box>
            <Chip size="small" label="เกณฑ์ประกันคุณภาพ SAR" color="primary" variant="outlined" sx={{ height: 22, fontSize: "0.7rem", alignSelf: { xs: "flex-start", sm: "auto" } }} />
          </Box>

          <Box sx={{ width: "100%", height: 310 }}>
            <BarChart
              dataset={chartData}
              xAxis={[{ scaleType: "band", dataKey: "standard" }]}
              series={[
                { dataKey: "เป้าหมาย", label: "ค่าเป้าหมายแผนก (%)", color: "#94a3b8" },
                { dataKey: "ผลประเมินจริง", label: "ผลงานจริง (%)", color: "#2563eb" },
              ]}
              height={290}
              margin={{ top: 20, bottom: 45, left: 40, right: 10 }}
              slotProps={{
                legend: {
                  direction: "horizontal",
                  position: { vertical: "bottom", horizontal: "center" },
                },
              }}
            />
          </Box>
        </Paper>

        {/* 2. License Risk Horizon Pie Chart */}
        <Paper sx={{ p: { xs: 1.5, sm: 2 }, border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <VerifiedUserIcon sx={{ fontSize: 20, color: "success.main" }} />
            <Box>
              <Typography variant="h3" sx={{ fontSize: "0.95rem", fontWeight: 700 }}>
                สถานะใบอนุญาตวิชาชีพครู (KSP Horizon)
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                เฝ้าระวังความเสี่ยงใบอนุญาตคุรุสภาและหนังสือผ่อนผัน
              </Typography>
            </Box>
          </Box>

          <Box sx={{ width: "100%", height: 310, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <PieChart
              series={[
                {
                  data: pieData,
                  innerRadius: 45,
                  outerRadius: 95,
                  paddingAngle: 3,
                  cornerRadius: 4,
                  highlightScope: { fade: "global", highlight: "item" },
                },
              ]}
              height={290}
              slotProps={{
                legend: {
                  direction: "horizontal",
                  position: { vertical: "bottom", horizontal: "center" },
                },
              }}
            />
          </Box>
        </Paper>
      </Box>

      {/* Row 2: Academic Qualification & Academic Rank Distribution (SAR Standard 2) */}
      {(academicRanks.length > 0 || qualifications.length > 0) && (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1.4fr 1fr" }, gap: { xs: 1.5, sm: 2 } }}>
          {/* Academic Rank Distribution */}
          <Paper sx={{ p: { xs: 1.5, sm: 2 }, border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, gap: 1, mb: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <SchoolIcon sx={{ fontSize: 20, color: "primary.main" }} />
                <Box>
                  <Typography variant="h3" sx={{ fontSize: "0.95rem", fontWeight: 700 }}>
                    การแจกแจงวิทยฐานะของบุคลากร (Academic Rank Distribution)
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    สัดส่วนครูผู้ช่วย, ครู, ชำนาญการ, ชำนาญการพิเศษ และเชี่ยวชาญ (มาตรฐานที่ 2)
                  </Typography>
                </Box>
              </Box>
              <Chip size="small" label="มาตรฐานที่ 2 SAR" variant="outlined" sx={{ height: 22, fontSize: "0.7rem", alignSelf: { xs: "flex-start", sm: "auto" } }} />
            </Box>

            <Box sx={{ width: "100%", height: 260 }}>
              <BarChart
                dataset={rankChartData}
                xAxis={[{ scaleType: "band", dataKey: "rank" }]}
                series={[{ dataKey: "จำนวน", label: "จำนวนครู (คน)", color: "#3b82f6" }]}
                height={240}
                margin={{ top: 20, bottom: 40, left: 40, right: 10 }}
              />
            </Box>
          </Paper>

          {/* Highest Qualification Distribution */}
          <Paper sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="h3" sx={{ fontSize: "0.95rem", fontWeight: 700 }}>
                วุฒิการศึกษาสูงสุดของคณาจารย์
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                สัดส่วนคุณวุฒิระดับปริญญาตรี ปริญญาโท และปริญญาเอก
              </Typography>
            </Box>

            <Box sx={{ width: "100%", height: 260 }}>
              <BarChart
                dataset={qualChartData}
                xAxis={[{ scaleType: "band", dataKey: "degree" }]}
                series={[{ dataKey: "จำนวน", label: "จำนวน (คน)", color: "#10b981" }]}
                height={240}
                margin={{ top: 20, bottom: 40, left: 40, right: 10 }}
              />
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
}
