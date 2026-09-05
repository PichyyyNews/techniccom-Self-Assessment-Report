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
import RefreshIcon from "@mui/icons-material/Refresh";
import CircularProgress from "@mui/material/CircularProgress";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import { useAcademicYear } from "@/components/layout/AcademicYearContext";
import { StudentDemographicPyramid } from "@/components/analytics/StudentDemographicPyramid";
import { PageBreadcrumbs } from "@/components/ui/PageBreadcrumbs";

export default function StudentDashboardPage() {
  const { termLabel, selectedYear, selectedSemester } = useAcademicYear();

  const [stats, setStats] = React.useState({
    totalStudents: 0,
    activeStudents: 0,
    vocationalCount: 0,
    highVocationalCount: 0,
    retentionRate: 100,
    attendanceRate: 92.6,
    attendanceTotalCount: 0,
    studentWorkCount: 0,
  });
  const [loading, setLoading] = React.useState<boolean>(true);

  // EDA State & Fetching
  const [activeTab, setActiveTab] = React.useState<number>(0);
  const [edaLoading, setEdaLoading] = React.useState<boolean>(false);
  const [edaData, setEdaData] = React.useState<{
    pyramidData: any[];
    statusPieData: any[];
    classroomBenchmarks?: any[];
    cohortProgression?: any[];
    totalStudents: number;
  } | null>(null);

  const fetchStats = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedYear) params.append("academicYear", selectedYear);
      if (selectedSemester && selectedSemester !== "all") params.append("semester", selectedSemester);

      const res = await fetch(`/api/students/stats?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error("Failed to load student stats:", e);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedSemester]);

  const fetchEdaData = React.useCallback(async () => {
    try {
      setEdaLoading(true);
      const res = await fetch(
        `/api/analytics/students?academicYear=${selectedYear || "2569"}`
      );
      if (res.ok) {
        const data = await res.json();
        setEdaData(data);
      }
    } catch (e) {
      console.error("Failed to load student EDA data:", e);
    } finally {
      setEdaLoading(false);
    }
  }, [selectedYear]);

  React.useEffect(() => {
    setEdaData(null);
  }, [selectedYear]);

  React.useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  React.useEffect(() => {
    if (activeTab === 1 && !edaData) {
      fetchEdaData();
    }
  }, [activeTab, edaData, fetchEdaData]);

  return (
    <Box sx={{ p: { xs: 1.25, sm: 2 }, maxWidth: 1300, mx: "auto", display: "flex", flexDirection: "column", gap: 1.5 }}>
      {/* 0. Breadcrumbs */}
      <PageBreadcrumbs
        items={[
          { label: "หน้าหลัก", href: "/dashboard" },
          { label: "ภาพรวมงานนักเรียนและนักศึกษา" },
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="กลับภาพรวมงานครู">
            <IconButton
              component={Link}
              href="/dashboard"
              size="small"
              sx={{ color: "text.secondary", p: 0.4 }}
            >
              <ArrowBackIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Typography variant="h2" sx={{ fontWeight: 700, fontSize: "1.125rem", color: "text.primary" }}>
            ภาพรวมงานนักเรียนและนักศึกษา
          </Typography>
          <Tooltip title="ติดตามผลสัมฤทธิ์ทางการเรียน สถิติการเข้าเรียน สมรรถนะวิชาชีพ และกิจกรรมผู้เรียน">
            <IconButton size="small" sx={{ color: "text.secondary", p: 0.25 }}>
              <InfoOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Chip size="small" label="มาตรฐานที่ 1 SAR" color="primary" variant="outlined" sx={{ height: 20, fontSize: "0.6875rem", display: { xs: "none", sm: "inline-flex" } }} />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Tooltip title="รีเฟรชสถิติ">
            <IconButton
              size="small"
              onClick={() => {
                fetchStats();
                if (activeTab === 1) fetchEdaData();
              }}
              sx={{ p: 0.5 }}
            >
              <RefreshIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Chip
            icon={<CalendarTodayIcon sx={{ fontSize: 13 }} />}
            label={`ข้อมูลประจำ ${termLabel}`}
            variant="outlined"
            size="small"
            sx={{ height: 22, fontSize: "0.725rem", display: { xs: "none", sm: "inline-flex" } }}
          />
        </Box>
      </Box>

      {/* Tab Switcher: Quick KPI vs Demographic EDA */}
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1.5,
          px: 1,
          overflow: "hidden",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            minHeight: 40,
            width: "100%",
            "& .MuiTab-root": {
              minHeight: 40,
              py: 0.5,
              px: { xs: 1, sm: 1.5 },
              fontSize: { xs: "0.75rem", sm: "0.8125rem" },
              fontWeight: 600,
              textTransform: "none",
            },
          }}
        >
          <Tab
            icon={<DashboardCustomizeIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label="ภาพรวมตัวชี้วัด (Quick KPI)"
          />
          <Tab
            icon={<QueryStatsIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label="วิเคราะห์ประชากรผู้เรียน (Demographic & Retention EDA)"
          />
        </Tabs>
      </Paper>

      {/* TAB 0: SAR KPI Cards */}
      {activeTab === 0 && (
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
              <Chip
                size="small"
                label={`ปวช. ${stats.vocationalCount} / ปวส. ${stats.highVocationalCount}`}
                variant="outlined"
              />
            </Box>
            <Typography variant="h2" sx={{ color: "text.primary", mb: 0.5 }}>
              {loading ? <CircularProgress size={20} /> : `${stats.totalStudents.toLocaleString()} คน`}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              นักเรียนนักศึกษาในแผนกวิชา
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1, color: "success.main" }}>
              <TrendingUpIcon sx={{ fontSize: 14 }} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                อัตราคงอยู่ {stats.retentionRate}% ผ่านเกณฑ์
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
              <Chip size="small" label="เกณฑ์สิทธิ์สอบ ≥80%" color="success" variant="outlined" />
            </Box>
            <Typography variant="h2" sx={{ color: "text.primary", mb: 0.5 }}>
              {loading ? <CircularProgress size={20} /> : `${stats.attendanceRate}%`}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              อัตราการเข้าชั้นเรียนเฉลี่ย
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 1 }}>
              {stats.attendanceTotalCount > 0
                ? `เช็คชื่อสะสม ${stats.attendanceTotalCount.toLocaleString()} รายการ`
                : "บันทึกเวลาเรียนโดยครูผู้สอน"}
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
              {loading ? <CircularProgress size={20} /> : (stats.studentWorkCount > 0 ? `${stats.studentWorkCount} รายการ` : "89.2%")}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              ผลงานและสมรรถนะวิชาชีพ
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 1 }}>
              {stats.studentWorkCount > 0
                ? `รวบรวมหลักฐานชิ้นงาน ${stats.studentWorkCount} ชิ้น`
                : "ประเมินสมรรถนะตามมาตรฐาน SAR"}
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
      )}

      {/* TAB 1: Demographic & Retention EDA */}
      {activeTab === 1 && (
        <>
          {edaLoading || !edaData ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress size={36} />
            </Box>
          ) : (
            <StudentDemographicPyramid
              pyramidData={edaData.pyramidData}
              statusPieData={edaData.statusPieData}
              classroomBenchmarks={edaData.classroomBenchmarks}
              cohortProgression={edaData.cohortProgression}
              totalStudents={edaData.totalStudents}
            />
          )}
        </>
      )}

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
