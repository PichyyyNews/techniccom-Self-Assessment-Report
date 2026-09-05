"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import LinearProgress from "@mui/material/LinearProgress";
import Rating from "@mui/material/Rating";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AddIcon from "@mui/icons-material/Add";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { LiveEvidenceSection } from "@/components/evidence/LiveEvidenceSection";
import { useAcademicYear } from "@/components/layout/AcademicYearContext";
import { PageBreadcrumbs } from "@/components/ui/PageBreadcrumbs";

export default function LessonPlansPage() {
  const { termLabel, selectedYear, selectedSemester } = useAcademicYear();

  const [summary, setSummary] = useState({
    count: 0,
    targetAssignments: 0,
    completionRate: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [selfScore, setSelfScore] = useState<number | null>(4);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedYear) params.append("academicYear", selectedYear);
      if (selectedSemester && selectedSemester !== "all") params.append("semester", selectedSemester);
      const res = await fetch(`/api/teachers/summary?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.lessonPlans) {
          setSummary(data.lessonPlans);
        }
      }
    } catch (e) {
      console.error("Failed to load lesson plans summary:", e);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedSemester]);

  React.useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: { xs: 1.5, sm: 2.5 } }}>
      {/* Breadcrumbs Navigation */}
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0, flexWrap: "wrap" }}>
          <Tooltip title="กลับหน้าหลัก">
            <IconButton
              component={Link}
              href="/dashboard"
              size="small"
              sx={{ color: "text.secondary", p: 0.4 }}
            >
              <ArrowBackIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Typography variant="h2" noWrap sx={{ fontWeight: 700, fontSize: { xs: "0.95rem", sm: "1.125rem" }, color: "text.primary" }}>
            แผนการจัดการเรียนรู้ และ บันทึกหลังสอน
          </Typography>
          <Tooltip title="ระบบจัดเก็บแผนการสอนมุ่งเน้นสมรรถนะอาชีพ บันทึกผลการจัดการเรียนรู้ และร่องรอยการประเมินผู้เรียน">
            <IconButton size="small" sx={{ color: "text.secondary", p: 0.25 }}>
              <InfoOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Chip size="small" label="มาตรฐานที่ 2 SAR" color="primary" variant="outlined" sx={{ height: 20, fontSize: "0.6875rem", display: { xs: "none", sm: "inline-flex" } }} />
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
            component={Link}
            href="/quick-upload"
            variant="contained"
            size="small"
            startIcon={<AddIcon sx={{ fontSize: 15 }} />}
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
            เพิ่มแผนการสอน
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
            แผนการสอนที่ส่งแล้วในระบบ
          </Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography variant="h3" sx={{ color: "text.primary", fontSize: "1.25rem", fontWeight: 700 }}>
              {loading ? "..." : `${summary.count} แผน`}
            </Typography>
            <Typography variant="caption" sx={{ color: summary.count > 0 ? "success.main" : "text.secondary", fontWeight: 600, fontSize: "0.725rem" }}>
              {summary.targetAssignments > 0 ? `มอบหมาย ${summary.targetAssignments} วิชา` : "รอบปีการศึกษานี้"}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(100, summary.completionRate || (summary.count > 0 ? 100 : 0))}
            sx={{ height: 5, borderRadius: 1, mt: 1 }}
          />
        </Paper>

        <Paper sx={{ p: 1.5, borderRadius: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block", mb: 0.25, fontSize: "0.75rem" }}>
            ความพร้อมเอกสารประกอบการสอน
          </Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography variant="h3" sx={{ color: "text.primary", fontSize: "1.25rem", fontWeight: 700 }}>
              {loading ? "..." : `${summary.completionRate}%`}
            </Typography>
            <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 600, fontSize: "0.725rem" }}>
              สอดคล้องกับตัวชี้วัด SAR 2.1
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            color="primary"
            value={Math.min(100, summary.completionRate)}
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

      {/* 3. SAR Criteria & Guidelines Accordion */}
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Accordion variant="outlined" sx={{ border: "none" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <MenuBookIcon sx={{ fontSize: 18, color: "primary.main" }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.875rem" }}>
                เกณฑ์และแนวทางการประเมินตามมาตรฐาน SAR ด้านการจัดการเรียนรู้ (มาตรฐานที่ 2)
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0, pb: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.5 }}>
              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1.5, bgcolor: "action.hover" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: "primary.main" }}>
                  1. แผนการจัดการเรียนรู้มุ่งเน้นสมรรถนะ
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.6, display: "block" }}>
                  • มีการวิเคราะห์หลักสูตร คำอธิบายรายวิชา และตารางวิเคราะห์สมรรถนะรายหน่วย<br />
                  • บูรณาการคุณธรรม จริยธรรม ค่านิยม ปรัชญาเศรษฐกิจพอเพียง หรือ STEM/ทวิภาคี<br />
                  • มีใบงาน แบบทดสอบ และสื่อการจัดการเรียนรู้ประกอบครบถ้วน
                </Typography>
              </Paper>

              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1.5, bgcolor: "action.hover" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: "success.main" }}>
                  2. บันทึกหลังการสอนและการวัดผลตามสภาพจริง
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.6, display: "block" }}>
                  • บันทึกผลการจัดการเรียนรู้ ปัญหา อุปสรรค และแนวทางแก้ไขรายสัปดาห์<br />
                  • เครื่องมือวัดผลประเมินผลตามสภาพจริง (Authentic Assessment)<br />
                  • มีร่องรอยการซ่อมเสริมหรือพัฒนาผู้เรียนเพื่อนำไปสู่งานวิจัยในชั้นเรียน
                </Typography>
              </Paper>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Paper>

      {/* 4. Live Uploaded Evidence Files */}
      <LiveEvidenceSection
        category="lesson_plan"
        sectionTitle="ไฟล์แผนการจัดการเรียนรู้ที่จัดเก็บในระบบ"
        emptyNotice="ยังไม่มีไฟล์แผนการสอนที่จัดเก็บในรอบปีการศึกษานี้"
        hideUploadButton
      />
    </Box>
  );
}
