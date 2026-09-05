"use client";

import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
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

interface SarRadarTargetChartProps {
  metrics: SarStandardMetric[];
  licenses: LicenseItem[];
}

export function SarRadarTargetChart({ metrics, licenses }: SarRadarTargetChartProps) {
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

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" }, gap: 2 }}>
      {/* 1. Target vs Actual Bar Chart */}
      <Paper sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
          <Box>
            <Typography variant="h3" sx={{ fontSize: "0.95rem", fontWeight: 700 }}>
              🎯 การประเมินความพร้อม SAR 3 มาตรฐาน (Target vs Actual)
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              เปรียบเทียบค่าเป้าหมายของแผนก กับผลการดำเนินงานจริงที่ระบบรวบรวมได้
            </Typography>
          </Box>
          <Chip size="small" label="เกณฑ์ประกันคุณภาพ SAR" color="primary" variant="outlined" sx={{ height: 22, fontSize: "0.7rem" }} />
        </Box>

        <Box sx={{ width: "100%", height: 320 }}>
          <BarChart
            dataset={chartData}
            xAxis={[{ scaleType: "band", dataKey: "standard" }]}
            series={[
              { dataKey: "เป้าหมาย", label: "ค่าเป้าหมายแผนก (%)", color: "#94a3b8" },
              { dataKey: "ผลประเมินจริง", label: "ผลงานจริง (%)", color: "#2563eb" },
            ]}
            height={300}
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
      <Paper sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="h3" sx={{ fontSize: "0.95rem", fontWeight: 700 }}>
            🛡️ สถานะใบอนุญาตวิชาชีพครู (KSP Horizon)
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            เฝ้าระวังความเสี่ยงใบอนุญาตคุรุสภาและหนังสือผ่อนผัน
          </Typography>
        </Box>

        <Box sx={{ width: "100%", height: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
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
  );
}
