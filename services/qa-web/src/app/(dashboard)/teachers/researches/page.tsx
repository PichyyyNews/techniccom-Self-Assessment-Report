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
import Rating from "@mui/material/Rating";
import LinearProgress from "@mui/material/LinearProgress";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AddIcon from "@mui/icons-material/Add";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ScienceIcon from "@mui/icons-material/Science";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

import { LiveEvidenceSection } from "@/components/evidence/LiveEvidenceSection";
import { useAcademicYear } from "@/components/layout/AcademicYearContext";
import { PageBreadcrumbs } from "@/components/ui/PageBreadcrumbs";

export default function ResearchesPage() {
  const { termLabel, selectedYear, selectedSemester } = useAcademicYear();

  const [summary, setSummary] = useState({
    count: 0,
    awardCount: 0,
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
        if (data.researches) {
          setSummary(data.researches);
        }
      }
    } catch (e) {
      console.error("Failed to load researches summary:", e);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedSemester]);

  React.useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return (
    <Box sx={{ p: { xs: 1.25, sm: 2 }, maxWidth: 1300, mx: "auto", display: "flex", flexDirection: "column", gap: 1.5 }}>
      {/* 0. Breadcrumbs */}
      <PageBreadcrumbs
        items={[
          { label: "ครูและบุคลากร", href: "/dashboard" },
          { label: "งานวิจัยและสิ่งประดิษฐ์" },
        ]}
      />

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
            งานวิจัย นวัตกรรม และ สิ่งประดิษฐ์
          </Typography>
          <Tooltip title="ฐานข้อมูลงานวิจัยในชั้นเรียน นวัตกรรมการเรียนรู้ และสิ่งประดิษฐ์ของคนรุ่นใหม่ร่วมกับนักศึกษา">
            <IconButton size="small" sx={{ color: "text.secondary", p: 0.25 }}>
              <InfoOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Chip size="small" label="มาตรฐานที่ 3 SAR" color="warning" variant="outlined" sx={{ height: 20, fontSize: "0.6875rem", display: { xs: "none", sm: "inline-flex" } }} />
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
            เพิ่มงานวิจัย
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
            งานวิจัยในชั้นเรียน (CAR)
          </Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography variant="h3" sx={{ color: "text.primary", fontSize: "1.25rem", fontWeight: 700 }}>
              {loading ? "..." : `${summary.count} ผลงาน`}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: summary.count > 0 ? "success.main" : "text.secondary",
                fontWeight: 600,
                fontSize: "0.725rem",
              }}
            >
              {summary.count > 0 ? "เป้าหมายอย่างน้อย 1 เรื่อง/ปี" : "รอบปีการศึกษานี้"}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            color={summary.count >= 1 ? "success" : "warning"}
            value={Math.min(100, (summary.count / 1) * 100)}
            sx={{ height: 5, borderRadius: 1, mt: 1 }}
          />
        </Paper>

        <Paper sx={{ p: 1.5, borderRadius: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block", mb: 0.25, fontSize: "0.75rem" }}>
            นวัตกรรม สิ่งประดิษฐ์ และรางวัล
          </Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography variant="h3" sx={{ color: "text.primary", fontSize: "1.25rem", fontWeight: 700 }}>
              {loading ? "..." : `${summary.awardCount} รายการ`}
            </Typography>
            <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 600, fontSize: "0.725rem" }}>
              สอดคล้องกับตัวชี้วัด SAR 3.1
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            color="primary"
            value={summary.awardCount > 0 ? 100 : 0}
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
              <ScienceIcon sx={{ fontSize: 18, color: "warning.main" }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.875rem" }}>
                เกณฑ์และแนวทางการประเมินตามมาตรฐาน SAR ด้านงานวิจัย นวัตกรรม และสิ่งประดิษฐ์ (มาตรฐานที่ 3)
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0, pb: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.5 }}>
              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1.5, bgcolor: "action.hover" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: "warning.main" }}>
                  1. การวิจัยเพื่อแก้ปัญหาและพัฒนาการเรียนรู้ (CAR)
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.6, display: "block" }}>
                  ครูผู้สอนทุกคนต้องจัดทำวิจัยในชั้นเรียนอย่างน้อยภาคเรียนละ 1 เรื่อง หรือปีการศึกษาละ 1 เรื่อง มุ่งเน้นการแก้ปัญหาผู้เรียน การสร้างนวัตกรรมการสอน หรือการใช้เทคโนโลยีดิจิทัลในการยกระดับผลสัมฤทธิ์
                </Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1.5, bgcolor: "action.hover" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: "warning.main" }}>
                  2. สิ่งประดิษฐ์คนรุ่นใหม่และนวัตกรรมอาชีวศึกษา
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.6, display: "block" }}>
                  การให้คำปรึกษาและพานักเรียนนักศึกษาประกวดสิ่งประดิษฐ์คนรุ่นใหม่ ผลงานนวัตกรรม การจดสิทธิบัตร/อนุสิทธิบัตร หรือการถ่ายทอดเทคโนโลยีสู่ชุมชนและสถานประกอบการ
                </Typography>
              </Paper>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Paper>

      {/* 4. Live Uploaded Evidence Files */}
      <LiveEvidenceSection
        category="research"
        sectionTitle="เอกสารงานวิจัยและสิ่งประดิษฐ์ที่จัดเก็บในระบบ"
        emptyNotice="ยังไม่มีเอกสารงานวิจัยหรือสิ่งประดิษฐ์ในรอบปีการศึกษานี้"
        hideUploadButton
      />
    </Box>
  );
}
