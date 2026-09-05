"use client";

import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import { BarChart } from "@mui/x-charts/BarChart";

interface TrainingBin {
  range: string;
  count: number;
  color: string;
}

interface TeacherWorkload {
  name: string;
  fullName: string;
  weeklyHours: number;
  assignedCourses: number;
  trainingHours: number;
}

interface FacultyWorkloadChartProps {
  trainingBins: TrainingBin[];
  workloadData: TeacherWorkload[];
}

export function FacultyWorkloadChart({ trainingBins, workloadData }: FacultyWorkloadChartProps) {
  const binChartData = trainingBins.map((b) => ({
    range: b.range,
    จำนวนครู: b.count,
  }));

  const workloadChartData = workloadData.slice(0, 8).map((w) => ({
    teacher: w.name,
    ภาระงานสอน: w.weeklyHours,
    ชั่วโมงอบรม: w.trainingHours,
  }));

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2 }}>
      {/* 1. Training Hours Distribution Histogram */}
      <Paper sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
          <Box>
            <Typography variant="h3" sx={{ fontSize: "0.95rem", fontWeight: 700 }}>
              ⏱️ การกระจายตัวชั่วโมงอบรมครู (Training Hours Histogram)
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              การแจกแจงจำนวนครูตามช่วงชั่วโมงอบรม เกณฑ์ SAR มาตรฐาน 2 (≥ 20 ชม./คน/ปี)
            </Typography>
          </Box>
          <Chip size="small" label="เกณฑ์ขั้นต่ำ 20 ชม." color="success" variant="outlined" sx={{ height: 22, fontSize: "0.7rem" }} />
        </Box>

        <Box sx={{ width: "100%", height: 300 }}>
          <BarChart
            dataset={binChartData}
            xAxis={[{ scaleType: "band", dataKey: "range" }]}
            series={[{ dataKey: "จำนวนครู", label: "จำนวนครู (คน)", color: "#0ea5e9" }]}
            height={280}
            margin={{ top: 20, bottom: 35, left: 40, right: 10 }}
          />
        </Box>
      </Paper>

      {/* 2. Teacher Workload Comparison */}
      <Paper sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
          <Box>
            <Typography variant="h3" sx={{ fontSize: "0.95rem", fontWeight: 700 }}>
              ⚖️ ภาระงานสอนและพัฒนาตนเองรายบุคคล (Workload EDA)
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              เปรียบเทียบภาระคาบสอนต่อสัปดาห์ กับชั่วโมงการพัฒนาวิชาชีพของครูแต่ละท่าน
            </Typography>
          </Box>
          <Chip size="small" label="สัปดาห์ละไม่เกิน 24 คาบ" variant="outlined" sx={{ height: 22, fontSize: "0.7rem" }} />
        </Box>

        <Box sx={{ width: "100%", height: 300 }}>
          <BarChart
            dataset={workloadChartData}
            xAxis={[{ scaleType: "band", dataKey: "teacher" }]}
            series={[
              { dataKey: "ภาระงานสอน", label: "ภาระสอน (คาบ/สัปดาห์)", color: "#6366f1" },
              { dataKey: "ชั่วโมงอบรม", label: "อบรมสะสม (ชม.)", color: "#10b981" },
            ]}
            height={280}
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
    </Box>
  );
}
