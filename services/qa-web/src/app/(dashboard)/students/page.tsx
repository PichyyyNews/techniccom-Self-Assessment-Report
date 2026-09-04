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

export default function StudentsPage() {
  const { termLabel } = useAcademicYear();
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const sampleStudents = [
    {
      code: "66209010001",
      name: "นายสมชาย ใจมั่น",
      classLevel: "ปวช 2 สาขาช่างเทคนิคคอมพิวเตอร์",
      advisor: "อ.วิชัย เกียรติสกุล",
      status: "กำลังศึกษา",
    },
    {
      code: "66209010015",
      name: "นางสาววิภาดา แก้วเกิด",
      classLevel: "ปวช 2 สาขาช่างเทคนิคคอมพิวเตอร์",
      advisor: "อ.วิชัย เกียรติสกุล",
      status: "กำลังศึกษา",
    },
    {
      code: "65309010005",
      name: "นายกิตติศักดิ์ รัตนผล",
      classLevel: "ปวส 1 สาขาเทคโนโลยีสารสนเทศ",
      advisor: "อ.ณัฐพร ศรีวิชัย",
      status: "กำลังศึกษา",
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
            ทะเบียนข้อมูลนักเรียนและนักศึกษา
          </Typography>
          <Tooltip title="ฐานข้อมูลทะเบียนนักเรียนนักศึกษา แยกตามระดับชั้น ปวช และ ปวส สาขาวิชา และครูที่ปรึกษา">
            <IconButton size="small" sx={{ color: "text.secondary", p: 0.25 }}>
              <InfoOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Chip size="small" label="มาตรฐานที่ 1 SAR" color="primary" variant="outlined" sx={{ height: 20, fontSize: "0.6875rem" }} />
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
            นำเข้านักศึกษา
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
            จำนวนนักเรียนและนักศึกษาทั้งหมด
          </Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography variant="h3" sx={{ color: "text.primary", fontSize: "1.25rem", fontWeight: 700 }}>
              1,248 คน
            </Typography>
            <Typography variant="caption" sx={{ color: "success.main", fontWeight: 600, fontSize: "0.725rem" }}>
              ปวช 820 • ปวส 428
            </Typography>
          </Box>
        </Paper>

        <Paper sx={{ p: 1.25 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block", mb: 0.25, fontSize: "0.75rem" }}>
            อัตราการคงอยู่ของผู้เรียน
          </Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography variant="h3" sx={{ color: "text.primary", fontSize: "1.25rem", fontWeight: 700 }}>
              98.4%
            </Typography>
            <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 600, fontSize: "0.725rem" }}>
              ผ่านเกณฑ์มาตรฐาน สอศ
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
                <TableCell>รหัสนักศึกษา</TableCell>
                <TableCell>ชื่อ นามสกุล</TableCell>
                <TableCell>ระดับชั้น และ สาขาวิชา</TableCell>
                <TableCell>ครูที่ปรึกษา</TableCell>
                <TableCell align="right">สถานะภาพ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sampleStudents.map((std) => (
                <TableRow key={std.code} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {std.code}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{std.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {std.classLevel}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={std.advisor} color="primary" variant="outlined" />
                  </TableCell>
                  <TableCell align="right">
                    <Chip size="small" label={std.status} color="success" />
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
          ระบบฟอร์มบันทึกข้อมูลจะเปิดให้เชื่อมต่อกับฐานข้อมูลในรอบถัดไป
        </Alert>
      </Snackbar>
    </Box>
  );
}
