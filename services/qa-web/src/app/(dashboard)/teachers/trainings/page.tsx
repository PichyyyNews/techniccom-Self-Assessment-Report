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
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SchoolIcon from "@mui/icons-material/School";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";

import { LiveEvidenceSection } from "@/components/evidence/LiveEvidenceSection";
import { useAcademicYear } from "@/components/layout/AcademicYearContext";
import { PageBreadcrumbs } from "@/components/ui/PageBreadcrumbs";

export default function TrainingsPage() {
  const { termLabel, selectedYear, selectedSemester } = useAcademicYear();

  const [summary, setSummary] = useState({
    totalHours: 0,
    totalItems: 0,
    certCount: 0,
    photoCount: 0,
    speakerCount: 0,
    meetsRequirement: false,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [selfScore, setSelfScore] = useState<number | null>(5);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedYear) params.append("academicYear", selectedYear);
      if (selectedSemester && selectedSemester !== "all") params.append("semester", selectedSemester);
      const res = await fetch(`/api/teachers/summary?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.trainings) {
          setSummary(data.trainings);
        }
      }
    } catch (e) {
      console.error("Failed to load trainings summary:", e);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedSemester]);

  React.useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return (
    <Box sx={{ p: { xs: 1.25, sm: 2 }, maxWidth: 1300, mx: "auto", display: "flex", flexDirection: "column", gap: 1.5 }}>
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
            การพัฒนาวิชาชีพ และ อบรมสัมมนา
          </Typography>
          <Tooltip title="บันทึกประวัติการอบรม พัฒนาสมรรถนะวิชาชีพครู และการแลกเปลี่ยนเรียนรู้ชุมชนทางวิชาชีพ PLC">
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
            เพิ่มการอบรม
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
            ชั่วโมงอบรมพัฒนาสะสม
          </Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography variant="h3" sx={{ color: "text.primary", fontSize: "1.25rem", fontWeight: 700 }}>
              {loading ? "..." : `${summary.totalHours} ชั่วโมง`}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: summary.meetsRequirement ? "success.main" : "warning.main",
                fontWeight: 600,
                fontSize: "0.725rem",
              }}
            >
              {summary.meetsRequirement ? "ผ่านเกณฑ์ขั้นต่ำ 20 ชม." : "เป้าหมาย 20 ชม./ปี"}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            color={summary.meetsRequirement ? "success" : "warning"}
            value={Math.min(100, Math.round((summary.totalHours / 20) * 100))}
            sx={{ height: 5, borderRadius: 1, mt: 1 }}
          />
        </Paper>

        <Paper sx={{ p: 1.5, borderRadius: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block", mb: 0.25, fontSize: "0.75rem" }}>
            หลักฐานวุฒิบัตรและการเป็นวิทยากร
          </Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography variant="h3" sx={{ color: "text.primary", fontSize: "1.25rem", fontWeight: 700 }}>
              {loading ? "..." : `${summary.certCount} วุฒิบัตร`}
            </Typography>
            <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 600, fontSize: "0.725rem" }}>
              {summary.speakerCount > 0 ? `วิทยากร ${summary.speakerCount} ครั้ง` : `รวมหลักฐาน ${summary.totalItems} ไฟล์`}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            color="primary"
            value={Math.min(100, (summary.totalItems / 5) * 100)}
            sx={{ height: 5, borderRadius: 1, mt: 1 }}
          />
        </Paper>

        <Paper sx={{ p: 1.5, borderRadius: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block", mb: 0.25, fontSize: "0.75rem" }}>
            การประเมินตนเอง (Professional Growth)
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
            ระดับคุณภาพ: {selfScore && selfScore >= 4 ? "ผ่านเกณฑ์และขยายผลความรู้" : "อยู่ในเกณฑ์มาตรฐาน"}
          </Typography>
        </Paper>
      </Box>

      {/* 3. SAR Criteria & Guidelines Accordion */}
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Accordion variant="outlined" sx={{ border: "none" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <WorkspacePremiumIcon sx={{ fontSize: 18, color: "primary.main" }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.875rem" }}>
                เกณฑ์และแนวทางการประเมินตามมาตรฐาน SAR ด้านการพัฒนาตนเองและวิชาชีพ (มาตรฐานที่ 2)
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0, pb: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.5 }}>
              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1.5, bgcolor: "action.hover" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: "primary.main" }}>
                  1. การพัฒนาสมรรถนะในสาขาวิชาชีพ
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.6, display: "block" }}>
                  • เข้ารับการอบรม สัมมนา หรือศึกษาดูงานในสาขาวิชาชีพไม่น้อยกว่า 20 ชั่วโมง/ปี<br />
                  • มีวุฒิบัตร เกียรติบัตร หรือหนังสือรับรองการเข้าร่วมกิจกรรมที่ออกโดยหน่วยงานที่น่าเชื่อถือ<br />
                  • แนบภาพถ่ายประกอบการเข้าร่วมกิจกรรมและสรุปรายงานผลการอบรม
                </Typography>
              </Paper>

              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1.5, bgcolor: "action.hover" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: "success.main" }}>
                  2. การเป็นวิทยากรและการแลกเปลี่ยนเรียนรู้ (PLC)
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.6, display: "block" }}>
                  • มีการนำความรู้ที่ได้รับมาถ่ายทอดขยายผลแก่ครูและบุคลากรในสถานศึกษา<br />
                  • กิจกรรมชุมชนแห่งการเรียนรู้ทางวิชาชีพ (Professional Learning Community - PLC)<br />
                  • ได้รับเชิญเป็นวิทยากรบรรยายหรือผู้เชี่ยวชาญให้คำปรึกษาภายนอกสถานศึกษา
                </Typography>
              </Paper>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Paper>

      {/* 4. Live Uploaded Evidence Files */}
      <LiveEvidenceSection
        category={["training_cert", "training_photo", "speaker_activity"]}
        sectionTitle="หลักฐานวุฒิบัตร ภาพการอบรมดูงาน และการเป็นวิทยากร"
        emptyNotice="ยังไม่มีหลักฐานการอบรมหรือวิทยากรในรอบปีการศึกษานี้"
        hideUploadButton
      />
    </Box>
  );
}
