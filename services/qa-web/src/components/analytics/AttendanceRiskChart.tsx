"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorIcon from "@mui/icons-material/Error";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TimelineIcon from "@mui/icons-material/Timeline";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import { LineChart } from "@mui/x-charts/LineChart";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";

interface WeeklyTrendItem {
  week: string;
  weekNum: number;
  rate: number;
  presentCount: number;
  absentCount: number;
  totalChecked: number;
}

interface RiskSegmentItem {
  id: string;
  label: string;
  count: number;
  color: string;
}

interface RoomComparisonItem {
  room: string;
  rate: number;
  totalChecked: number;
}

interface DayOfWeekItem {
  day: string;
  rate: number;
  present: number;
  late: number;
  absent: number;
  leave: number;
}

interface AbsenceDecompositionItem {
  id: number;
  label: string;
  value: number;
  color: string;
}

interface AtRiskStudentItem {
  studentCode: string;
  name: string;
  room: string;
  present: number;
  late: number;
  absent: number;
  leave: number;
  total: number;
  rate: number;
  riskLevel: "WARNING" | "CRITICAL";
}

interface AttendanceRiskChartProps {
  weeklyTrend: WeeklyTrendItem[];
  riskSegments: RiskSegmentItem[];
  roomComparison: RoomComparisonItem[];
  atRiskStudents: AtRiskStudentItem[];
  dayOfWeekPattern?: DayOfWeekItem[];
  absenceDecomposition?: AbsenceDecompositionItem[];
}

export function AttendanceRiskChart({
  weeklyTrend,
  riskSegments,
  roomComparison,
  atRiskStudents,
  dayOfWeekPattern = [],
  absenceDecomposition = [],
}: AttendanceRiskChartProps) {
  const [filterRisk, setFilterRisk] = useState<"ALL" | "WARNING" | "CRITICAL">("ALL");

  const weeks = weeklyTrend.map((w) => `${w.weekNum}`);
  const rates = weeklyTrend.map((w) => w.rate);

  const riskBarData = riskSegments.map((r) => ({
    tier: r.label,
    จำนวนนักศึกษา: r.count,
  }));

  const roomChartData = roomComparison.map((r) => ({
    room: r.room,
    อัตราเข้าเรียน: r.rate,
  }));

  const dayChartData = dayOfWeekPattern.map((d) => ({
    day: d.day,
    ร้อยละเข้าเรียน: d.rate,
  }));

  const filteredStudents = atRiskStudents.filter((s) => {
    if (filterRisk === "ALL") return true;
    return s.riskLevel === filterRisk;
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* 1. 18-Week Longitudinal Attendance Trend (LineChart) */}
      <Paper sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TimelineIcon sx={{ fontSize: 20, color: "primary.main" }} />
            <Box>
              <Typography variant="h3" sx={{ fontSize: "0.95rem", fontWeight: 700 }}>
                แนวโน้มการเข้าชั้นเรียน 18 สัปดาห์ (Longitudinal Time-Series Trend)
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                ติดตามความต่อเนื่องและตรวจจับการลดลงของอัตราการเข้าเรียนตามช่วงสัปดาห์ตลอดภาคเรียน
              </Typography>
            </Box>
          </Box>
          <Chip size="small" label="เกณฑ์ขั้นต่ำสิทธิ์สอบ 80%" color="success" variant="outlined" sx={{ height: 22, fontSize: "0.7rem" }} />
        </Box>

        <Box sx={{ width: "100%", height: 300 }}>
          <LineChart
            xAxis={[
              {
                scaleType: "point",
                data: weeks,
                label: "สัปดาห์ที่ (1 - 18)",
              },
            ]}
            yAxis={[{ min: 50, max: 100, label: "ร้อยละการเข้าเรียน (%)" }]}
            series={[
              {
                data: rates,
                label: "อัตราการมาเรียนเฉลี่ย (%)",
                color: "#2563eb",
                showMark: true,
              },
            ]}
            height={280}
            margin={{ top: 20, bottom: 45, left: 50, right: 20 }}
          />
        </Box>
      </Paper>

      {/* 2. Grid: Risk Histogram & Room Benchmark */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2 }}>
        {/* Risk Tiers Histogram */}
        <Paper sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <WarningAmberIcon sx={{ fontSize: 20, color: "warning.main" }} />
              <Box>
                <Typography variant="h3" sx={{ fontSize: "0.95rem", fontWeight: 700 }}>
                  การจัดกลุ่มความเสี่ยงเวลาเรียน (Risk Segmentation)
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  แจกแจงนักศึกษาตามเกณฑ์ 80% (เสี่ยงเฝ้าระวัง 70-79% vs วิกฤตหมดสิทธิ์สอบ &lt;70%)
                </Typography>
              </Box>
            </Box>
            <Chip size="small" label="เกณฑ์การคัดกรอง SAR" color="warning" variant="outlined" sx={{ height: 22, fontSize: "0.7rem" }} />
          </Box>

          <Box sx={{ width: "100%", height: 280 }}>
            <BarChart
              dataset={riskBarData}
              xAxis={[{ scaleType: "band", dataKey: "tier" }]}
              series={[{ dataKey: "จำนวนนักศึกษา", label: "จำนวนนักเรียน (คน)", color: "#f59e0b" }]}
              height={260}
              margin={{ top: 20, bottom: 40, left: 40, right: 10 }}
            />
          </Box>
        </Paper>

        {/* Room Benchmark */}
        <Paper sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <GroupWorkIcon sx={{ fontSize: 20, color: "success.main" }} />
              <Box>
                <Typography variant="h3" sx={{ fontSize: "0.95rem", fontWeight: 700 }}>
                  เปรียบเทียบผลการเข้าเรียนรายกลุ่มเรียน (Classroom Benchmark)
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  เปรียบเทียบร้อยละการเข้าเรียนเฉลี่ยในแต่ละห้องเรียนเพื่อค้นหาห้องที่ต้องการการสนับสนุน
                </Typography>
              </Box>
            </Box>
            <Chip size="small" label="เกณฑ์เฉลี่ยแผนก 92.6%" variant="outlined" sx={{ height: 22, fontSize: "0.7rem" }} />
          </Box>

          <Box sx={{ width: "100%", height: 280 }}>
            <BarChart
              dataset={roomChartData}
              xAxis={[{ scaleType: "band", dataKey: "room" }]}
              series={[{ dataKey: "อัตราเข้าเรียน", label: "ร้อยละเข้าเรียน (%)", color: "#10b981" }]}
              height={260}
              margin={{ top: 20, bottom: 40, left: 40, right: 10 }}
            />
          </Box>
        </Paper>
      </Box>

      {/* 3. Grid: Day-of-Week Effect & Absence Decomposition */}
      {(dayOfWeekPattern.length > 0 || absenceDecomposition.length > 0) && (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1.3fr 1fr" }, gap: 2 }}>
          {/* Day of Week Attendance Pattern */}
          <Paper sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarMonthIcon sx={{ fontSize: 20, color: "primary.main" }} />
                <Box>
                  <Typography variant="h3" sx={{ fontSize: "0.95rem", fontWeight: 700 }}>
                    พฤติกรรมการเข้าเรียนรายวันในสัปดาห์ (Day-of-Week Pattern)
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    วิเคราะห์อัตราการเข้าเรียนแยกตามวัน (จันทร์ - ศุกร์) เพื่อตรวจจับ Day-of-Week Effect
                  </Typography>
                </Box>
              </Box>
              <Chip size="small" label="จันทร์ - ศุกร์" variant="outlined" sx={{ height: 22, fontSize: "0.7rem" }} />
            </Box>

            <Box sx={{ width: "100%", height: 260 }}>
              <BarChart
                dataset={dayChartData}
                xAxis={[{ scaleType: "band", dataKey: "day" }]}
                series={[{ dataKey: "ร้อยละเข้าเรียน", label: "อัตราการมาเรียน (%)", color: "#6366f1" }]}
                height={240}
                margin={{ top: 20, bottom: 40, left: 40, right: 10 }}
              />
            </Box>
          </Paper>

          {/* Absence Type Decomposition */}
          <Paper sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <DonutLargeIcon sx={{ fontSize: 20, color: "secondary.main" }} />
              <Box>
                <Typography variant="h3" sx={{ fontSize: "0.95rem", fontWeight: 700 }}>
                  สัดส่วนจำแนกสถานะการเข้าเรียน (Absence Breakdown)
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  แจกแจงสัดส่วนมาเรียนปกติ มาสาย ลาป่วย/ลากิจ และขาดเรียน
                </Typography>
              </Box>
            </Box>

            <Box sx={{ width: "100%", height: 260, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PieChart
                series={[
                  {
                    data: absenceDecomposition,
                    innerRadius: 40,
                    outerRadius: 85,
                    paddingAngle: 3,
                    cornerRadius: 4,
                    highlightScope: { fade: "global", highlight: "item" },
                  },
                ]}
                height={240}
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
      )}

      {/* 3. Early Warning Action Table (At-Risk Students) */}
      <Paper sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, mb: 1.5, gap: 1 }}>
          <Box>
            <Typography variant="h3" sx={{ fontSize: "0.95rem", fontWeight: 700, color: "error.main", display: "flex", alignItems: "center", gap: 0.75 }}>
              <WarningAmberIcon fontSize="small" /> ระบบเตือนภัยล่วงหน้า: นักเรียนกลุ่มเสี่ยงหมดสิทธิ์สอบ (Early Warning System)
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              รายชื่อนักศึกษาที่มีเวลาเรียนต่ำกว่า 80% ต้องการการติดตามจากครูที่ปรึกษาและครูผู้สอนทันที
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
            <Button
              size="small"
              variant={filterRisk === "ALL" ? "contained" : "outlined"}
              color="inherit"
              onClick={() => setFilterRisk("ALL")}
              sx={{ height: 26, fontSize: "0.7rem" }}
            >
              ทั้งหมด ({atRiskStudents.length})
            </Button>
            <Button
              size="small"
              variant={filterRisk === "WARNING" ? "contained" : "outlined"}
              color="warning"
              onClick={() => setFilterRisk("WARNING")}
              sx={{ height: 26, fontSize: "0.7rem" }}
            >
              เฝ้าระวัง 70-79%
            </Button>
            <Button
              size="small"
              variant={filterRisk === "CRITICAL" ? "contained" : "outlined"}
              color="error"
              onClick={() => setFilterRisk("CRITICAL")}
              sx={{ height: 26, fontSize: "0.7rem" }}
            >
              วิกฤต &lt;70%
            </Button>
          </Box>
        </Box>

        {filteredStudents.length === 0 ? (
          <Alert severity="success" icon={<CheckCircleIcon fontSize="inherit" />} sx={{ py: 1 }}>
            ยอดเยี่ยม! ในกลุ่มเป้าหมายนี้ไม่มีนักเรียนที่เวลาเรียนต่ำกว่าเกณฑ์ 80%
          </Alert>
        ) : (
          <TableContainer sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, maxHeight: 320, overflowX: "auto", width: "100%" }}>
            <Table size="small" stickyHeader>
              <TableHead sx={{ bgcolor: "action.hover" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", width: { xs: 95, sm: 120 } }}>รหัสนักศึกษา</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem" }}>ชื่อ - นามสกุล</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", width: { xs: 80, sm: 100 } }}>กลุ่มเรียน</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", width: 85, textAlign: "center" }}>ร้อยละเข้าเรียน</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", width: 70, textAlign: "center", display: { xs: "none", sm: "table-cell" } }}>ขาด (คาบ)</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", width: 70, textAlign: "center", display: { xs: "none", sm: "table-cell" } }}>ลา (คาบ)</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", width: 70, textAlign: "center", display: { xs: "none", sm: "table-cell" } }}>สาย (คาบ)</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", width: { xs: 110, sm: 130 }, textAlign: "center" }}>สถานะความเสี่ยง</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents.map((s, idx) => (
                  <TableRow key={idx} hover sx={{ bgcolor: s.riskLevel === "CRITICAL" ? "error.50" : undefined }}>
                    <TableCell sx={{ fontSize: "0.8125rem", fontWeight: 600 }}>{s.studentCode}</TableCell>
                    <TableCell sx={{ fontSize: "0.8125rem" }}>{s.name}</TableCell>
                    <TableCell sx={{ fontSize: "0.8125rem" }}>
                      <Chip size="small" label={s.room} variant="outlined" sx={{ height: 20, fontSize: "0.6875rem" }} />
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.8125rem", textAlign: "center", fontWeight: 700, color: s.riskLevel === "CRITICAL" ? "error.main" : "warning.main" }}>
                      {s.rate}%
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.8125rem", textAlign: "center", color: "error.main", fontWeight: 600, display: { xs: "none", sm: "table-cell" } }}>{s.absent}</TableCell>
                    <TableCell sx={{ fontSize: "0.8125rem", textAlign: "center", display: { xs: "none", sm: "table-cell" } }}>{s.leave}</TableCell>
                    <TableCell sx={{ fontSize: "0.8125rem", textAlign: "center", display: { xs: "none", sm: "table-cell" } }}>{s.late}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      {s.riskLevel === "CRITICAL" ? (
                        <Chip
                          size="small"
                          color="error"
                          icon={<ErrorIcon sx={{ fontSize: 13 }} />}
                          label="วิกฤต (<70%)"
                          sx={{ height: 22, fontSize: "0.6875rem", fontWeight: 700 }}
                        />
                      ) : (
                        <Chip
                          size="small"
                          color="warning"
                          icon={<WarningAmberIcon sx={{ fontSize: 13 }} />}
                          label="เฝ้าระวัง"
                          sx={{ height: 22, fontSize: "0.6875rem", fontWeight: 700 }}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}
