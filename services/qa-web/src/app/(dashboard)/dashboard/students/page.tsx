"use client";

import React from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SchoolIcon from "@mui/icons-material/School";
import GroupsIcon from "@mui/icons-material/Groups";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useAcademicYear } from "@/components/layout/AcademicYearContext";

export default function StudentDashboardPage() {
  const { termLabel } = useAcademicYear();

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
            ภาพรวมงานนักเรียนและนักศึกษา
          </Typography>
          <Tooltip title="ติดตามผลสัมฤทธิ์ทางการเรียน สถิติการเข้าเรียน สมรรถนะวิชาชีพ และกิจกรรมผู้เรียน">
            <IconButton size="small" sx={{ color: "text.secondary", p: 0.25 }}>
              <InfoOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Chip size="small" label="มาตรฐานที่ 1 SAR" color="primary" variant="outlined" sx={{ height: 20, fontSize: "0.6875rem" }} />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Chip
            icon={<CalendarTodayIcon sx={{ fontSize: 13 }} />}
            label={`ข้อมูลประจำ ${termLabel}`}
            variant="outlined"
            size="small"
            sx={{ height: 22, fontSize: "0.725rem", display: { xs: "none", sm: "inline-flex" } }}
          />
          <Button
            component={Link}
            href="/dashboard"
            variant="outlined"
            size="small"
            startIcon={<ArrowBackIcon sx={{ fontSize: 15 }} />}
            sx={{ px: 1.25, py: 0.4, fontSize: "0.75rem" }}
          >
            ภาพรวมงานครู
          </Button>
        </Box>
      </Box>

      {/* 2. SAR KPI Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
          gap: 2,
        }}
      >
        {/* Metric 1 */}
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                bgcolor: "primary.50",
                color: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <GroupsIcon fontSize="small" />
            </Box>
            <Chip size="small" label="ปวช และ ปวส" variant="outlined" />
          </Box>
          <Typography variant="h2" sx={{ color: "text.primary", mb: 0.5 }}>
            1,248 คน
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            นักเรียนนักศึกษาลงทะเบียน
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1, color: "success.main" }}>
            <TrendingUpIcon sx={{ fontSize: 14 }} />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              อัตราคงอยู่ 98.4% ผ่านเกณฑ์
            </Typography>
          </Box>
        </Paper>

        {/* Metric 2 */}
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                bgcolor: "success.50",
                color: "success.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FactCheckIcon fontSize="small" />
            </Box>
            <Chip size="small" label="รายคาบและวัน" color="success" variant="outlined" />
          </Box>
          <Typography variant="h2" sx={{ color: "text.primary", mb: 0.5 }}>
            92.6%
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            อัตราการเข้าชั้นเรียนเฉลี่ย
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 1 }}>
            บันทึกโดยครูผู้สอนครบถ้วน
          </Typography>
        </Paper>

        {/* Metric 3 */}
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                bgcolor: "secondary.50",
                color: "secondary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <EmojiEventsIcon fontSize="small" />
            </Box>
            <Chip size="small" label="มาตรฐานฝีมือ" color="secondary" variant="outlined" />
          </Box>
          <Typography variant="h2" sx={{ color: "text.primary", mb: 0.5 }}>
            89.2%
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            ผ่านการประเมินสมรรถนะ
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 1 }}>
            TPQI DSD และสภาวิชาชีพ
          </Typography>
        </Paper>

        {/* Metric 4 */}
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                bgcolor: "warning.50",
                color: "warning.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <WorkspacePremiumIcon fontSize="small" />
            </Box>
            <Chip size="small" label="กิจกรรมผู้เรียน" color="warning" variant="outlined" />
          </Box>
          <Typography variant="h2" sx={{ color: "text.primary", mb: 0.5 }}>
            95.1%
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            เข้าร่วมกิจกรรมพัฒนาผู้เรียน
          </Typography>
          <Typography variant="caption" sx={{ color: "warning.main", display: "block", mt: 1, fontWeight: 600 }}>
            ผ่านเกณฑ์กิจกรรมชมรมและจิตอาสา
          </Typography>
        </Paper>
      </Box>

      {/* 3. Quick Navigation Modules */}
      <Paper sx={{ p: 2.5 }}>
        <Typography variant="h4" sx={{ mb: 0.5 }}>
          โมดูลระบบงานนักเรียน
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>
          ระบบบันทึกและรวบรวมหลักฐานร่องรอยเพื่อนำเข้าเล่มรายงานการประเมินตนเอง SAR
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
            gap: 1.5,
          }}
        >
          <Paper
            component={Link}
            href="/students"
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              textDecoration: "none",
              color: "inherit",
              bgcolor: "background.default",
              transition: "all 0.15s ease",
              "&:hover": { borderColor: "primary.main", bgcolor: "background.paper" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
              <GroupsIcon color="primary" fontSize="small" />
              <ChevronRightIcon fontSize="small" sx={{ color: "text.secondary" }} />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                ทะเบียนข้อมูลนักเรียน
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5 }}>
                ฐานข้อมูลประวัติและสถานะนักศึกษา
              </Typography>
            </Box>
          </Paper>

          <Paper
            component={Link}
            href="/students/attendance"
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              textDecoration: "none",
              color: "inherit",
              bgcolor: "background.default",
              transition: "all 0.15s ease",
              "&:hover": { borderColor: "primary.main", bgcolor: "background.paper" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
              <FactCheckIcon color="success" fontSize="small" />
              <ChevronRightIcon fontSize="small" sx={{ color: "text.secondary" }} />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                เช็คชื่อและพฤติกรรม
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5 }}>
                บันทึกการเข้าเรียนรายคาบและพฤติกรรม
              </Typography>
            </Box>
          </Paper>

          <Paper
            component={Link}
            href="/students/competencies"
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              textDecoration: "none",
              color: "inherit",
              bgcolor: "background.default",
              transition: "all 0.15s ease",
              "&:hover": { borderColor: "primary.main", bgcolor: "background.paper" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
              <EmojiEventsIcon color="secondary" fontSize="small" />
              <ChevronRightIcon fontSize="small" sx={{ color: "text.secondary" }} />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                ผลสัมฤทธิ์และสมรรถนะ
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5 }}>
                เกรดเฉลี่ย VNET และใบรับรองทักษะ
              </Typography>
            </Box>
          </Paper>

          <Paper
            component={Link}
            href="/students/activities"
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              textDecoration: "none",
              color: "inherit",
              bgcolor: "background.default",
              transition: "all 0.15s ease",
              "&:hover": { borderColor: "primary.main", bgcolor: "background.paper" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
              <WorkspacePremiumIcon color="warning" fontSize="small" />
              <ChevronRightIcon fontSize="small" sx={{ color: "text.secondary" }} />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                กิจกรรมผู้เรียนและชมรม
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5 }}>
                เช็คชื่อหน้าเสาธงและกิจกรรมจิตอาสา
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
}
