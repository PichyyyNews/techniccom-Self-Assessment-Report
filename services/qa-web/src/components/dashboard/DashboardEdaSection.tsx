"use client";

import React, { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import { useAcademicYear } from "@/components/layout/AcademicYearContext";
import { SarRadarTargetChart } from "@/components/analytics/SarRadarTargetChart";
import { FacultyWorkloadChart } from "@/components/analytics/FacultyWorkloadChart";

interface DashboardEdaSectionProps {
  canManageUsers: boolean;
  sarLicensePercentage: number;
  validLicenseCount: number;
  totalActiveTeachers: number;
  expiringCount: number;
}

export function DashboardEdaSection({
  canManageUsers,
  sarLicensePercentage,
  validLicenseCount,
  totalActiveTeachers,
  expiringCount,
}: DashboardEdaSectionProps) {
  const { selectedYear, selectedSemester, termLabel } = useAcademicYear();

  const [activeTab, setActiveTab] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [edaData, setEdaData] = useState<{
    sarStandardsRadar: any[];
    trainingBins: any[];
    workloadData: any[];
    licenseDistribution: any[];
    qualificationData?: any[];
    academicRankData?: any[];
    researchProductivity?: any[];
    planCompletionRate?: number;
    totalTeachers: number;
    avgTrainingHours: number;
  } | null>(null);

  const fetchEdaData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/analytics/overview?academicYear=${selectedYear || "2569"}&semester=${selectedSemester || "1"}`
      );
      if (res.ok) {
        const data = await res.json();
        setEdaData(data);
      }
    } catch (e) {
      console.error("Failed to load EDA overview data:", e);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedSemester]);

  useEffect(() => {
    if (activeTab === 1 && !edaData) {
      fetchEdaData();
    }
  }, [activeTab, edaData, fetchEdaData]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Tab Switcher: Quick KPI vs EDA Analytics */}
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
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            minHeight: 44,
            "& .MuiTab-root": {
              minHeight: 44,
              py: 0.75,
              px: { xs: 1.5, sm: 2 },
              fontSize: { xs: "0.8rem", sm: "0.875rem" },
              fontWeight: 600,
              textTransform: "none",
              whiteSpace: "nowrap",
              maxWidth: "none",
              lineHeight: 1.5,
            },
          }}
        >
          <Tab
            icon={<DashboardCustomizeIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label="ภาพรวมด่วน (Quick KPI)"
          />
          <Tab
            icon={<QueryStatsIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label="การวิเคราะห์เชิงลึก SAR & บุคลากร (EDA Analytics)"
          />
        </Tabs>

        {activeTab === 1 && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, pr: 1, flexShrink: 0 }}>
            <Chip
              size="small"
              label={`รอบ ${termLabel}`}
              variant="outlined"
              sx={{ height: 22, fontSize: "0.7rem", display: { xs: "none", sm: "inline-flex" } }}
            />
            <Tooltip title="รีเฟรชการวิเคราะห์ข้อมูล">
              <IconButton size="small" onClick={fetchEdaData} sx={{ p: 0.4 }}>
                <RefreshIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Paper>

      {/* TAB 0: ภาพรวมด่วน (Quick KPI) */}
      {activeTab === 0 && canManageUsers && (
        <Paper sx={{ p: 2.5, border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontSize: "1rem", fontWeight: 700 }}>
                มาตรฐานด้านคุณวุฒิและมาตรฐานวิชาชีพครู
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                เกณฑ์การประเมินคุณภาพการศึกษา สอศ และคุรุสภา
              </Typography>
            </Box>
            <Chip size="small" label="ตัวชี้วัดความพร้อม SAR" color="success" variant="outlined" sx={{ height: 22, fontSize: "0.7rem" }} />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
              gap: 2,
            }}
          >
            {/* Metric 1 */}
            <Paper sx={{ p: 2, bgcolor: "background.default", border: "1px solid", borderColor: "divider" }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block", mb: 0.5 }}>
                ร้อยละครูที่มีใบอนุญาตถูกต้อง
              </Typography>
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 1 }}>
                <Typography variant="h1" sx={{ color: totalActiveTeachers > 0 ? "primary.main" : "text.secondary", fontSize: "2rem", fontWeight: 700 }}>
                  {totalActiveTeachers > 0 ? `${sarLicensePercentage}%` : "-"}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {totalActiveTeachers > 0 ? `${validLicenseCount}/${totalActiveTeachers} ท่าน` : "ยังไม่มีข้อมูลบุคลากร"}
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={totalActiveTeachers > 0 ? sarLicensePercentage : 0} sx={{ height: 6, borderRadius: 3 }} />
            </Paper>

            {/* Metric 2 */}
            <Paper sx={{ p: 2, bgcolor: "background.default", border: "1px solid", borderColor: "divider" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
                <CheckCircleIcon sx={{ fontSize: 16, color: validLicenseCount > 0 ? "success.main" : "text.disabled" }} />
                <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
                  ใบอนุญาตพร้อมใช้งาน
                </Typography>
              </Box>
              <Typography variant="h2" sx={{ color: validLicenseCount > 0 ? "text.primary" : "text.secondary", mb: 0.5, fontSize: "1.5rem", fontWeight: 700 }}>
                {validLicenseCount > 0 ? `${validLicenseCount} คน` : "-"}
              </Typography>
              <Typography variant="caption" sx={{ color: validLicenseCount > 0 ? "success.main" : "text.secondary", fontWeight: 600 }}>
                {validLicenseCount > 0 ? "ผ่านเกณฑ์มาตรฐานวิชาชีพ" : "ยังไม่มีบันทึกใบอนุญาต"}
              </Typography>
            </Paper>

            {/* Metric 3 */}
            <Paper sx={{ p: 2, bgcolor: "background.default", border: "1px solid", borderColor: "divider" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
                <AccessTimeIcon sx={{ fontSize: 16, color: expiringCount > 0 ? "warning.main" : "text.disabled" }} />
                <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
                  ใกล้หมดอายุ หรือต้องต่ออายุ
                </Typography>
              </Box>
              <Typography variant="h2" sx={{ color: expiringCount > 0 ? "warning.main" : "text.secondary", mb: 0.5, fontSize: "1.5rem", fontWeight: 700 }}>
                {expiringCount > 0 ? `${expiringCount} คน` : "0 คน"}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                หมดอายุภายใน 180 วัน
              </Typography>
            </Paper>
          </Box>
        </Paper>
      )}

      {/* TAB 1: การวิเคราะห์เชิงลึก (EDA Analytics) */}
      {activeTab === 1 && (
        <>
          {loading || !edaData ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress size={36} />
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* 1. SAR Target vs Actual, License Horizon & Qualification/Rank */}
              <SarRadarTargetChart
                metrics={edaData.sarStandardsRadar}
                licenses={edaData.licenseDistribution}
                qualifications={edaData.qualificationData}
                academicRanks={edaData.academicRankData}
              />

              {/* 2. Training Histogram, Faculty Workload & Academic Productivity */}
              <FacultyWorkloadChart
                trainingBins={edaData.trainingBins}
                workloadData={edaData.workloadData}
                researchProductivity={edaData.researchProductivity}
                planCompletionRate={edaData.planCompletionRate}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
