"use client";

import React, { useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
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
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import SchoolIcon from "@mui/icons-material/School";

import { LiveEvidenceSection } from "@/components/evidence/LiveEvidenceSection";
import { useAcademicYear } from "@/components/layout/AcademicYearContext";
import { PageBreadcrumbs } from "@/components/ui/PageBreadcrumbs";

export default function CompetenciesPage() {
  const { termLabel } = useAcademicYear();
  const [selfScore, setSelfScore] = useState<number | null>(4);

  return (
    <Box sx={{ p: { xs: 1.25, sm: 2 }, maxWidth: 1300, mx: "auto", display: "flex", flexDirection: "column", gap: 1.5 }}>
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
            ผลสัมฤทธิ์ และ สมรรถนะวิชาชีพ
          </Typography>
          <Tooltip title="ศูนย์รวมคะแนนผลสัมฤทธิ์ทางการเรียน ผลการทดสอบ VNET และการประเมินมาตรฐานวิชาชีพ TPQI และ DSD">
            <IconButton size="small" sx={{ color: "text.secondary", p: 0.25 }}>
              <InfoOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Chip size="small" label="มาตรฐานที่ 1 SAR" color="primary" variant="outlined" sx={{ height: 20, fontSize: "0.6875rem", display: { xs: "none", sm: "inline-flex" } }} />
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
            บันทึกสมรรถนะ
          </Button>
        </Box>
      </Box>

      {/* 2. Compact KPI Summary Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
          gap: 1.5,
        }}
      >
        <Paper sx={{ p: 1.5, borderRadius: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block", mb: 0.25, fontSize: "0.75rem" }}>
            เกรดเฉลี่ยสะสมเฉลี่ย (GPAX)
          </Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography variant="h3" sx={{ color: "text.primary", fontSize: "1.25rem", fontWeight: 700 }}>
              3.18
            </Typography>
            <Typography variant="caption" sx={{ color: "success.main", fontWeight: 600, fontSize: "0.725rem" }}>
              +0.12 จากปีก่อน
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            color="success"
            value={(3.18 / 4.0) * 100}
            sx={{ height: 5, borderRadius: 1, mt: 1 }}
          />
        </Paper>

        <Paper sx={{ p: 1.5, borderRadius: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block", mb: 0.25, fontSize: "0.75rem" }}>
            ผ่านประเมินมาตรฐานวิชาชีพ
          </Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography variant="h3" sx={{ color: "text.primary", fontSize: "1.25rem", fontWeight: 700 }}>
              89.2%
            </Typography>
            <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 600, fontSize: "0.725rem" }}>
              ระดับ 1-3 (TPQI/DSD)
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            color="primary"
            value={89.2}
            sx={{ height: 5, borderRadius: 1, mt: 1 }}
          />
        </Paper>

        <Paper sx={{ p: 1.5, borderRadius: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block", mb: 0.25, fontSize: "0.75rem" }}>
            ผลการทดสอบระดับชาติ (V-NET)
          </Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography variant="h3" sx={{ color: "text.primary", fontSize: "1.25rem", fontWeight: 700 }}>
              74.5%
            </Typography>
            <Typography variant="caption" sx={{ color: "info.main", fontWeight: 600, fontSize: "0.725rem" }}>
              ผ่านเกณฑ์เป้าหมาย สอศ.
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            color="info"
            value={74.5}
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
              <SchoolIcon sx={{ fontSize: 18, color: "primary.main" }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.875rem" }}>
                เกณฑ์และแนวทางการประเมินตามมาตรฐาน SAR ด้านคุณภาพผู้เรียนและสมรรถนะวิชาชีพ (มาตรฐานที่ 1)
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0, pb: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.5 }}>
              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1.5, bgcolor: "action.hover" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: "primary.main", display: "flex", alignItems: "center", gap: 0.75 }}>
                  <AssignmentTurnedInIcon sx={{ fontSize: 16 }} />
                  1. การประเมินสมรรถนะวิชาชีพ (Vocational Competency)
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.6, display: "block" }}>
                  การวัดผลสัมฤทธิ์ผ่านเกณฑ์รายวิชาชีพเฉพาะ การทดสอบภาคปฏิบัติจริงในห้องปฏิบัติการ และการประเมินสมรรถนะการฝึกงานในสถานประกอบการตามข้อตกลงความร่วมมือ (DVT)
                </Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1.5, bgcolor: "action.hover" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: "primary.main", display: "flex", alignItems: "center", gap: 0.75 }}>
                  <MilitaryTechIcon sx={{ fontSize: 16 }} />
                  2. มาตรฐานคุณวุฒิวิชาชีพ และ V-NET
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.6, display: "block" }}>
                  ร้อยละของผู้สำเร็จการศึกษาที่ผ่านการทดสอบทางการศึกษาระดับชาติด้านอาชีวศึกษา (V-NET) และการทดสอบรับรองคุณวุฒิวิชาชีพ TPQI หรือมาตรฐานฝีมือแรงงานแห่งชาติ (DSD)
                </Typography>
              </Paper>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Paper>

      {/* 4. Live Uploaded Evidence Files */}
      <LiveEvidenceSection
        category="student_work"
        sectionTitle="หลักฐานชิ้นงานและผลงานนักศึกษา"
        emptyNotice="ยังไม่มีการอัปโหลดชิ้นงานนักศึกษาในรอบปีการศึกษานี้"
        hideUploadButton
      />
    </Box>
  );
}
