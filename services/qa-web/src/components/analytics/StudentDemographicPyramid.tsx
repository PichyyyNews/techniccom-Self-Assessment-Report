"use client";

import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";

interface PyramidCohortItem {
  cohort: string;
  male: number;
  female: number;
  total: number;
}

interface StatusPieItem {
  id: number;
  value: number;
  label: string;
  color: string;
}

interface StudentDemographicPyramidProps {
  pyramidData: PyramidCohortItem[];
  statusPieData: StatusPieItem[];
  totalStudents: number;
}

export function StudentDemographicPyramid({
  pyramidData,
  statusPieData,
  totalStudents,
}: StudentDemographicPyramidProps) {
  const chartData = pyramidData.map((p) => ({
    cohort: p.cohort,
    ชาย: p.male,
    หญิง: p.female,
  }));

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "2fr 1.2fr" }, gap: 2 }}>
      {/* 1. Population Structure by Cohort and Gender */}
      <Paper sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
          <Box>
            <Typography variant="h3" sx={{ fontSize: "0.95rem", fontWeight: 700 }}>
              🏛️ พีระมิดโครงสร้างประชากรผู้เรียน (Population Pyramid)
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              การแจกแจงจำนวนนักศึกษาตามระดับชั้น ชั้นปี (ปวช.1-3, ปวส.1-2) และสัดส่วนเพศ ชาย/หญิง
            </Typography>
          </Box>
          <Chip
            size="small"
            label={`รวมทั้งหมด ${totalStudents.toLocaleString()} คน`}
            color="primary"
            variant="outlined"
            sx={{ height: 22, fontSize: "0.7rem" }}
          />
        </Box>

        <Box sx={{ width: "100%", height: 320 }}>
          <BarChart
            dataset={chartData}
            xAxis={[{ scaleType: "band", dataKey: "cohort" }]}
            series={[
              { dataKey: "ชาย", label: "นักเรียนชาย (คน)", color: "#2563eb", stack: "gender" },
              { dataKey: "หญิง", label: "นักเรียนหญิง (คน)", color: "#ec4899", stack: "gender" },
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

      {/* 2. Retention Survival / Student Status Breakdown */}
      <Paper sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="h3" sx={{ fontSize: "0.95rem", fontWeight: 700 }}>
            📉 สัดส่วนสถานะภาพและอัตราคงอยู่ (Retention EDA)
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            วิเคราะห์อัตราการคงอยู่ กำลังศึกษา พักการเรียน และพ้นสภาพ
          </Typography>
        </Box>

        <Box sx={{ width: "100%", height: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <PieChart
            series={[
              {
                data: statusPieData,
                innerRadius: 40,
                outerRadius: 90,
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
