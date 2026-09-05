"use client";

import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import GroupsIcon from "@mui/icons-material/Groups";
import PieChartIcon from "@mui/icons-material/PieChart";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AddIcon from "@mui/icons-material/Add";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { LineChart } from "@mui/x-charts/LineChart";
import { EmptyState } from "@/components/ui/EmptyState";

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

interface ClassroomBenchmarkItem {
  room: string;
  count: number;
  minCriteria: number;
  targetCriteria: number;
  maxCriteria: number;
  status: string;
}

interface CohortProgressionItem {
  stage: string;
  count: number;
  retentionRate: number;
}

interface StudentDemographicPyramidProps {
  pyramidData: PyramidCohortItem[];
  statusPieData: StatusPieItem[];
  classroomBenchmarks?: ClassroomBenchmarkItem[];
  cohortProgression?: CohortProgressionItem[];
  totalStudents: number;
}

export function StudentDemographicPyramid({
  pyramidData,
  statusPieData,
  classroomBenchmarks = [],
  cohortProgression = [],
  totalStudents,
}: StudentDemographicPyramidProps) {
  if (totalStudents === 0) {
    return (
      <EmptyState
        icon={<GroupsIcon sx={{ fontSize: 44, color: "text.secondary" }} />}
        title="ยังไม่มีข้อมูลนักเรียนในระบบ"
        description="เริ่มนำเข้าข้อมูลนักเรียนตามระดับชั้นและกลุ่มเรียน เพื่อให้ระบบวิเคราะห์โครงสร้างประชากรผู้เรียนและอัตราคงอยู่โดยอัตโนมัติ"
        actionLabel="นำเข้าข้อมูลนักเรียน"
        actionHref="/students"
        actionIcon={<AddIcon sx={{ fontSize: 16 }} />}
      />
    );
  }

  const chartData = pyramidData.map((p) => ({
    cohort: p.cohort,
    ชาย: p.male,
    หญิง: p.female,
  }));

  const roomChartData = classroomBenchmarks.map((c) => ({
    room: c.room,
    จำนวนนักศึกษา: c.count,
    เกณฑ์มาตรฐาน: c.targetCriteria,
  }));

  const progressionStages = cohortProgression.map((cp) => cp.stage);
  const progressionRates = cohortProgression.map((cp) => cp.retentionRate);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Row 1: Population Structure by Cohort/Gender & Retention Status */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "2fr 1.2fr" }, gap: { xs: 1.5, sm: 2 } }}>
        {/* 1. Population Structure by Cohort and Gender */}
        <Paper sx={{ p: { xs: 1.5, sm: 2 }, border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, gap: 1, mb: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <GroupsIcon sx={{ fontSize: 20, color: "primary.main" }} />
              <Box>
                <Typography variant="h3" sx={{ fontSize: "0.95rem", fontWeight: 700 }}>
                  โครงสร้างประชากรผู้เรียน (Population Pyramid)
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  การแจกแจงจำนวนนักศึกษาตามระดับชั้น ชั้นปี (ปวช.1-3, ปวส.1-2) และสัดส่วนเพศ ชาย/หญิง
                </Typography>
              </Box>
            </Box>
            <Chip
              size="small"
              label={`รวมทั้งหมด ${totalStudents.toLocaleString()} คน`}
              color="primary"
              variant="outlined"
              sx={{ height: 22, fontSize: "0.7rem", alignSelf: { xs: "flex-start", sm: "auto" } }}
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <PieChartIcon sx={{ fontSize: 20, color: "success.main" }} />
            <Box>
              <Typography variant="h3" sx={{ fontSize: "0.95rem", fontWeight: 700 }}>
                สัดส่วนสถานะภาพและอัตราคงอยู่ (Retention EDA)
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                วิเคราะห์อัตราการคงอยู่ กำลังศึกษา พักการเรียน และพ้นสภาพ
              </Typography>
            </Box>
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

      {/* Row 2: Classroom Size Benchmark & Cohort Progression Flow */}
      {(classroomBenchmarks.length > 0 || cohortProgression.length > 0) && (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1.4fr 1fr" }, gap: { xs: 1.5, sm: 2 } }}>
          {/* Classroom Size Benchmark vs Standard */}
          <Paper sx={{ p: { xs: 1.5, sm: 2 }, border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, gap: 1, mb: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <MeetingRoomIcon sx={{ fontSize: 20, color: "primary.main" }} />
                <Box>
                  <Typography variant="h3" sx={{ fontSize: "0.95rem", fontWeight: 700 }}>
                    ขนาดความจุกลุ่มเรียนเปรียบเทียบเกณฑ์ สอศ. (Class Size Benchmark)
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    เปรียบเทียบจำนวนนักเรียนรายห้องกับเกณฑ์มาตรฐาน (ขั้นต่ำ 20, เป้าหมาย 30, สูงสุด 35 คน)
                  </Typography>
                </Box>
              </Box>
              <Chip size="small" label="เกณฑ์ สอศ. 20-35 คน" color="success" variant="outlined" sx={{ height: 22, fontSize: "0.7rem", alignSelf: { xs: "flex-start", sm: "auto" } }} />
            </Box>

            <Box sx={{ width: "100%", height: 270 }}>
              <BarChart
                dataset={roomChartData}
                xAxis={[{ scaleType: "band", dataKey: "room" }]}
                series={[
                  { dataKey: "จำนวนนักศึกษา", label: "นักเรียนจริง (คน)", color: "#0ea5e9" },
                  { dataKey: "เกณฑ์มาตรฐาน", label: "เป้าหมาย สอศ. (30 คน)", color: "#cbd5e1" },
                ]}
                height={250}
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

          {/* Cohort Progression & Survival Rate Curve */}
          <Paper sx={{ p: { xs: 1.5, sm: 2 }, border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, gap: 1, mb: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TrendingUpIcon sx={{ fontSize: 20, color: "secondary.main" }} />
                <Box>
                  <Typography variant="h3" sx={{ fontSize: "0.95rem", fontWeight: 700 }}>
                    อัตราการคงอยู่สะสมข้ามชั้นปี (Cohort Progression)
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    ติดตามสัดส่วนการเลื่อนชั้นปีและการคงอยู่เพื่อตรวจจับช่วงเสี่ยง
                  </Typography>
                </Box>
              </Box>
              <Chip size="small" label="Cohort Survival" variant="outlined" sx={{ height: 22, fontSize: "0.7rem", alignSelf: { xs: "flex-start", sm: "auto" } }} />
            </Box>

            <Box sx={{ width: "100%", height: 270 }}>
              <LineChart
                xAxis={[
                  {
                    scaleType: "point",
                    data: progressionStages,
                  },
                ]}
                yAxis={[{ min: 50, max: 100, label: "อัตราคงอยู่ (%)" }]}
                series={[
                  {
                    data: progressionRates,
                    label: "อัตราคงอยู่ (%)",
                    color: "#8b5cf6",
                    showMark: true,
                  },
                ]}
                height={250}
                margin={{ top: 20, bottom: 45, left: 50, right: 15 }}
              />
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
}
