"use client";

import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BalanceIcon from "@mui/icons-material/Balance";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import LinearProgress from "@mui/material/LinearProgress";
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

interface ResearchProductivityItem {
  category: string;
  count: number;
  target: number;
}

interface FacultyWorkloadChartProps {
  trainingBins: TrainingBin[];
  workloadData: TeacherWorkload[];
  researchProductivity?: ResearchProductivityItem[];
  planCompletionRate?: number;
}

export function FacultyWorkloadChart({
  trainingBins,
  workloadData,
  researchProductivity = [],
  planCompletionRate = 87.5,
}: FacultyWorkloadChartProps) {
  const binChartData = trainingBins.map((b) => ({
    range: b.range,
    จำนวนครู: b.count,
  }));

  const workloadChartData = workloadData.slice(0, 8).map((w) => ({
    teacher: w.name,
    ภาระงานสอน: w.weeklyHours,
    ชั่วโมงอบรม: w.trainingHours,
  }));

  const prodChartData = researchProductivity.map((p) => ({
    category: p.category,
    ผลงานจริง: p.count,
    เป้าหมาย: p.target,
  }));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Row 1: Training Histogram & Workload Comparison */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2 }}>
        {/* 1. Training Hours Distribution Histogram */}
        <Paper sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AccessTimeIcon sx={{ fontSize: 20, color: "primary.main" }} />
              <Box>
                <Typography variant="h3" sx={{ fontSize: "0.95rem", fontWeight: 700 }}>
                  การกระจายตัวชั่วโมงอบรมครู (Training Hours Histogram)
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  การแจกแจงจำนวนครูตามช่วงชั่วโมงอบรม เกณฑ์ SAR มาตรฐาน 2 (≥ 20 ชม./คน/ปี)
                </Typography>
              </Box>
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <BalanceIcon sx={{ fontSize: 20, color: "secondary.main" }} />
              <Box>
                <Typography variant="h3" sx={{ fontSize: "0.95rem", fontWeight: 700 }}>
                  ภาระงานสอนและพัฒนาตนเองรายบุคคล (Workload EDA)
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  เปรียบเทียบภาระคาบสอนต่อสัปดาห์ กับชั่วโมงการพัฒนาวิชาชีพของครูแต่ละท่าน
                </Typography>
              </Box>
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

      {/* Row 2: Research & Academic Output Productivity */}
      {prodChartData.length > 0 && (
        <Paper sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5, flexWrap: "wrap", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <MenuBookIcon sx={{ fontSize: 20, color: "primary.main" }} />
              <Box>
                <Typography variant="h3" sx={{ fontSize: "0.95rem", fontWeight: 700 }}>
                  ผลิตภาพงานวิชาการ วิจัย และนวัตกรรม (Academic & Research Productivity)
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  การสร้างสรรค์งานวิจัยในชั้นเรียน นวัตกรรมสิ่งประดิษฐ์ และความครบถ้วนของแผนการสอนตามเกณฑ์ SAR
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                  ความพร้อมแผนการสอนในระบบ
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "primary.main" }}>
                  {planCompletionRate}% ครบตามเกณฑ์
                </Typography>
              </Box>
              <Box sx={{ width: 100 }}>
                <LinearProgress variant="determinate" value={planCompletionRate} sx={{ height: 6, borderRadius: 3 }} />
              </Box>
            </Box>
          </Box>

          <Box sx={{ width: "100%", height: 260 }}>
            <BarChart
              dataset={prodChartData}
              xAxis={[{ scaleType: "band", dataKey: "category" }]}
              series={[
                { dataKey: "ผลงานจริง", label: "ผลงานจริง (รายการ)", color: "#2563eb" },
                { dataKey: "เป้าหมาย", label: "เป้าหมายขั้นต่ำ (รายการ)", color: "#94a3b8" },
              ]}
              height={240}
              margin={{ top: 20, bottom: 40, left: 40, right: 10 }}
              slotProps={{
                legend: {
                  direction: "horizontal",
                  position: { vertical: "bottom", horizontal: "center" },
                },
              }}
            />
          </Box>
        </Paper>
      )}
    </Box>
  );
}
