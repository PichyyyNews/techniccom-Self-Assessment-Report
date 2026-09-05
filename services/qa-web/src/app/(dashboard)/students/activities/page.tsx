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
import Rating from "@mui/material/Rating";
import LinearProgress from "@mui/material/LinearProgress";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AddIcon from "@mui/icons-material/Add";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GroupsIcon from "@mui/icons-material/Groups";
import FlagIcon from "@mui/icons-material/Flag";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";

import { useAcademicYear } from "@/components/layout/AcademicYearContext";
import { PageBreadcrumbs } from "@/components/ui/PageBreadcrumbs";

export default function ActivitiesPage() {
  const { termLabel } = useAcademicYear();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [selfScore, setSelfScore] = useState<number | null>(5);

  const sampleActivities = [
    {
      name: "กิจกรรมเข้าแถวเคารพธงชาติและอบรมคุณธรรม",
      type: "กิจกรรมบังคับ หน้าเสาธง",
      participants: "1,248 คน",
      status: "ผ่านเกณฑ์ 95.1%",
    },
    {
      name: "ชมรมวิชาชีพช่างเทคนิคคอมพิวเตอร์",
      type: "กิจกรรมองค์การวิชาชีพ อวท",
      participants: "215 คน",
      status: "ผ่านเกณฑ์ 100%",
    },
    {
      name: "โครงการจิตอาสาพัฒนาชุมชนและสถานศึกษา",
      type: "กิจกรรมบำเพ็ญประโยชน์",
      participants: "450 คน",
      status: "ผ่านเกณฑ์ 98.2%",
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: { xs: 1.5, sm: 2.5 } }}>
      {/* 0. Breadcrumbs */}
      <PageBreadcrumbs />

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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
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
          <Typography variant="h2" noWrap sx={{ fontWeight: 700, fontSize: { xs: "0.95rem", sm: "1.125rem" }, color: "text.primary" }}>
            กิจกรรมผู้เรียน และ บันทึกหน้าเสาธง
          </Typography>
          <Tooltip title="บันทึกการเข้าร่วมกิจกรรมเข้าแถวหน้าเสาธง กิจกรรมชมรมวิชาชีพ อวท และกิจกรรมจิตอาสาเพื่อสังคม">
            <IconButton size="small" sx={{ color: "text.secondary", p: 0.25 }}>
              <InfoOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Chip size="small" label="มาตรฐานที่ 1 SAR" color="warning" variant="outlined" sx={{ height: 20, fontSize: "0.6875rem", display: { xs: "none", sm: "inline-flex" } }} />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Chip
            icon={<CalendarTodayIcon sx={{ fontSize: 13 }} />}
            label={`รอบข้อมูล ${termLabel}`}
            variant="outlined"
            size="small"
            sx={{ height: 22, fontSize: "0.725rem", display: { xs: "none", sm: "inline-flex" } }}
          />
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon sx={{ fontSize: 15 }} />}
            onClick={() => setSnackbarOpen(true)}
            sx={{
              px: 1.25,
              py: 0.35,
              fontSize: "0.75rem",
              fontWeight: 600,
              whiteSpace: "nowrap",
              flexShrink: 0,
              height: 30,
            }}
          >
            บันทึกกิจกรรม
          </Button>
        </Box>
      </Box>

      {/* 2. Compact KPI Summary Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: 1.5,
        }}
      >
        <Paper sx={{ p: 1.5, borderRadius: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block", mb: 0.25, fontSize: "0.75rem" }}>
            อัตราผ่านกิจกรรมหน้าเสาธง
          </Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography variant="h3" sx={{ color: "text.secondary", fontSize: "1.25rem", fontWeight: 700 }}>
              -
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.725rem" }}>
              ยังไม่มีบันทึกเวลาเข้าแถว
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            color="success"
            value={0}
            sx={{ height: 5, borderRadius: 1, mt: 1 }}
          />
        </Paper>

        <Paper sx={{ p: 1.5, borderRadius: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block", mb: 0.25, fontSize: "0.75rem" }}>
            นักเรียนสังกัดชมรมวิชาชีพ
          </Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography variant="h3" sx={{ color: "text.secondary", fontSize: "1.25rem", fontWeight: 700 }}>
              -
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.725rem" }}>
              ยังไม่มีข้อมูลสมาชิกชมรม
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            color="primary"
            value={0}
            sx={{ height: 5, borderRadius: 1, mt: 1 }}
          />
        </Paper>

        <Paper sx={{ p: 1.5, borderRadius: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block", mb: 0.25, fontSize: "0.75rem" }}>
            คะแนนประเมินตนเอง (SAR Self-Audit)
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.25 }}>
            <Rating
              size="small"
              value={selfScore}
              onChange={(_, newVal) => setSelfScore(newVal)}
            />
            <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main" }}>
              {selfScore}/5 ดาว
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5, fontSize: "0.7rem" }}>
            ระดับคุณภาพ: {selfScore && selfScore >= 4 ? "ยอดเยี่ยม (Level 4-5)" : "กำลังพัฒนา"}
          </Typography>
        </Paper>
      </Box>

      {/* 3. SAR Activity Rubrics Accordion */}
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Accordion variant="outlined" sx={{ border: "none" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <GroupsIcon sx={{ fontSize: 18, color: "warning.main" }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.875rem" }}>
                เกณฑ์และแนวทางการประเมินกิจกรรมพัฒนาผู้เรียน (SAR มาตรฐานที่ 1.2)
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0, pb: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.5 }}>
              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1.5, bgcolor: "action.hover" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: "warning.main", display: "flex", alignItems: "center", gap: 0.75 }}>
                  <FlagIcon sx={{ fontSize: 16 }} />
                  1. การร่วมกิจกรรมหน้าเสาธงและคุณธรรมจริยธรรม
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.6, display: "block" }}>
                  ผู้เรียนต้องเข้าร่วมกิจกรรมหน้าเสาธงไม่น้อยกว่าร้อยละ 85 ของวันที่มีการจัดกิจกรรม พร้อมบันทึกพฤติกรรมคุณธรรมอัตลักษณ์และค่านิยมหลัก
                </Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1.5, bgcolor: "action.hover" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: "warning.main", display: "flex", alignItems: "center", gap: 0.75 }}>
                  <VolunteerActivismIcon sx={{ fontSize: 16 }} />
                  2. องค์การวิชาชีพ (อวท.) และจิตอาสาเพื่อสังคม
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.6, display: "block" }}>
                  ผู้เรียนทุกคนเป็นสมาชิกองค์การนักวิชาชีพในอนาคตแห่งประเทศไทย (อวท.) เข้าร่วมกิจกรรมบำเพ็ญประโยชน์ หรือกิจกรรมจิตอาสาไม่น้อยกว่า 18 ชั่วโมงต่อภาคเรียน
                </Typography>
              </Paper>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Paper>

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

        <TableContainer sx={{ overflowX: "auto", width: "100%" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ชื่อกิจกรรม และ ชมรม</TableCell>
                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>ประเภทกิจกรรม</TableCell>
                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>ผู้เข้าร่วม</TableCell>
                <TableCell align="right">สถานะการประเมิน</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sampleActivities.map((row, idx) => (
                <TableRow key={idx} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {row.name}
                    </Typography>
                    <Typography variant="caption" sx={{ display: { xs: "block", sm: "none" }, color: "text.secondary" }}>
                      {row.type} • {row.participants}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      {row.type}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                    <Typography variant="body2">{row.participants}</Typography>
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
          ระบบฟอร์มบันทึกกิจกรรมจะเปิดให้เชื่อมต่อกับฐานข้อมูลในรอบถัดไป
        </Alert>
      </Snackbar>
    </Box>
  );
}
