"use client";

import React, { useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AddIcon from "@mui/icons-material/Add";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useAcademicYear } from "@/components/layout/AcademicYearContext";

export default function AttendancePage() {
  const { termLabel } = useAcademicYear();
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const sampleAttendance = [
    {
      course: "20105 2001 การเขียนโปรแกรม",
      group: "ปวช 2 ช่างเทคนิคคอมพิวเตอร์ กลุ่ม 1",
      totalPeriods: "64 คาบ",
      rate: "94.5%",
      status: "ผ่านเกณฑ์",
    },
    {
      course: "20105 2102 ระบบเครือข่ายเบื้องต้น",
      group: "ปวช 2 ช่างเทคนิคคอมพิวเตอร์ กลุ่ม 1",
      totalPeriods: "64 คาบ",
      rate: "92.0%",
      status: "ผ่านเกณฑ์",
    },
    {
      course: "30901 1002 ฐานข้อมูลเชิงสัมพันธ์",
      group: "ปวส 1 เทคโนโลยีสารสนเทศ กลุ่ม 1",
      totalPeriods: "72 คาบ",
      rate: "91.8%",
      status: "ผ่านเกณฑ์",
    },
  ];

  return (
    <Box sx={{ p: { xs: 1.25, sm: 2 }, maxWidth: 1300, mx: "auto", display: "flex", flexDirection: "column", gap: 1.5 }}>
      {/* 1. Ultra-Compact Page Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          pb: 0.75,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h2" sx={{ fontWeight: 700, fontSize: "1.125rem", color: "text.primary" }}>
            บันทึกการเข้าเรียน และ พฤติกรรม
          </Typography>
          <Tooltip title="ระบบบันทึกเวลาเรียนรายคาบโดยครูผู้สอน และบันทึกพฤติกรรมการมาเรียนเพื่อประเมินเวลาเรียน 80%">
            <IconButton size="small" sx={{ color: "text.secondary", p: 0.25 }}>
              <InfoOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Chip size="small" label="มาตรฐานที่ 1 SAR" color="success" variant="outlined" sx={{ height: 20, fontSize: "0.6875rem" }} />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Chip
            icon={<CalendarTodayIcon sx={{ fontSize: 13 }} />}
            label={`รอบข้อมูล ${termLabel}`}
            variant="outlined"
            size="small"
            sx={{ height: 22, fontSize: "0.725rem", display: { xs: "none", sm: "inline-flex" } }}
          />
          <Tooltip title="กลับภาพรวมงานนักเรียน">
            <IconButton
              component={Link}
              href="/dashboard/students"
              size="small"
              sx={{ color: "text.secondary", p: 0.4 }}
            >
              <ArrowBackIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon sx={{ fontSize: 15 }} />}
            onClick={() => setSnackbarOpen(true)}
            sx={{ px: 1.25, py: 0.35, fontSize: "0.75rem", fontWeight: 600 }}
          >
            เช็คชื่อวันนี้
          </Button>
        </Box>
      </Box>

      {/* 2. Compact KPI Summary Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
          gap: 1.5,
        }}
      >
        <Paper sx={{ p: 1.25 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block", mb: 0.25, fontSize: "0.75rem" }}>
            สถิติการมาเรียนเฉลี่ย
          </Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography variant="h3" sx={{ color: "text.primary", fontSize: "1.25rem", fontWeight: 700 }}>
              92.6%
            </Typography>
            <Typography variant="caption" sx={{ color: "success.main", fontWeight: 600, fontSize: "0.725rem" }}>
              คำนวณจากรายวิชาสอน
            </Typography>
          </Box>
        </Paper>

        <Paper sx={{ p: 1.25 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block", mb: 0.25, fontSize: "0.75rem" }}>
            ผ่านเกณฑ์เวลาเรียน 80%
          </Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography variant="h3" sx={{ color: "text.primary", fontSize: "1.25rem", fontWeight: 700 }}>
              99.1%
            </Typography>
            <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 600, fontSize: "0.725rem" }}>
              มีสิทธิ์สอบปลายภาค
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* 3. Data Table */}
      <Paper sx={{ overflow: "hidden" }}>
        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h4">
            รายการบันทึกข้อมูลประจำ {termLabel}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            แสดงรายการตัวอย่าง
          </Typography>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>รหัสวิชา และ รายวิชา</TableCell>
                <TableCell>กลุ่มเรียน</TableCell>
                <TableCell>จำนวนคาบสอน</TableCell>
                <TableCell>สถิติการมาเรียน</TableCell>
                <TableCell align="right">สถานะ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sampleAttendance.map((row, idx) => (
                <TableRow key={idx} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {row.course}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      {row.group}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{row.totalPeriods}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "success.main" }}>
                      {row.rate}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip size="small" label={row.status} color="success" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Snackbar feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="info" sx={{ width: "100%" }}>
          ระบบฟอร์มบันทึกเช็คชื่อจะเปิดให้เชื่อมต่อกับฐานข้อมูลในรอบถัดไป
        </Alert>
      </Snackbar>
    </Box>
  );
}
