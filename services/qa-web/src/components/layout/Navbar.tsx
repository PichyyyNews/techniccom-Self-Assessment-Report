"use client";

import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import MenuIcon from "@mui/icons-material/Menu";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckIcon from "@mui/icons-material/Check";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PersonIcon from "@mui/icons-material/Person";
import SecurityIcon from "@mui/icons-material/Security";
import LogoutIcon from "@mui/icons-material/Logout";
import { useSidebar } from "./SidebarContext";
import { useAcademicYear } from "./AcademicYearContext";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { toggleMobile } = useSidebar();
  const {
    selectedYear,
    setSelectedYear,
    selectedSemester,
    setSelectedSemester,
    availableYears,
    availableSemesters,
    shortTermLabel,
  } = useAcademicYear();

  // Term popover state
  const [termAnchorEl, setTermAnchorEl] = useState<null | HTMLElement>(null);
  const isTermOpen = Boolean(termAnchorEl);

  // User menu state
  const [userAnchorEl, setUserAnchorEl] = useState<null | HTMLElement>(null);
  const isUserOpen = Boolean(userAnchorEl);

  const isRoot = session?.user?.role === "ROOT";
  const userInitial = session?.user?.name ? session.user.name.charAt(0) : "U";

  const getPageTitle = () => {
    if (pathname === "/dashboard") return "ภาพรวมงานครูและบุคลากร";
    if (pathname === "/dashboard/students") return "ภาพรวมงานนักเรียนและนักศึกษา";
    if (pathname === "/profile") return "โปรไฟล์และประวัติการทำงาน";
    if (pathname === "/teachers/lesson-plans") return "แผนการจัดการเรียนรู้ และ บันทึกหลังสอน";
    if (pathname === "/teachers/trainings") return "การพัฒนาวิชาชีพ และ อบรมสัมมนา";
    if (pathname === "/teachers/researches") return "งานวิจัย นวัตกรรม และ สิ่งประดิษฐ์";
    if (pathname === "/students") return "ทะเบียนข้อมูลนักเรียนและนักศึกษา";
    if (pathname === "/students/attendance") return "บันทึกการเข้าเรียน และ พฤติกรรม";
    if (pathname === "/students/competencies") return "ผลสัมฤทธิ์ และ สมรรถนะวิชาชีพ";
    if (pathname === "/students/activities") return "กิจกรรมผู้เรียน และ หน้าเสาธง";
    if (pathname.startsWith("/admin/system")) return "ตั้งค่าระบบและมอนิเตอร์เซิร์ฟเวอร์";
    if (pathname.startsWith("/admin/users")) return "จัดการบัญชีผู้ใช้งานและสิทธิ์";
    if (pathname.startsWith("/admin/licenses")) return "ตั้งค่าประเภทใบอนุญาต และ มาตรฐานวิชาชีพ";
    if (pathname === "/quick-upload") return "ทางลัดอัปโหลดด่วน";
    if (pathname === "/stock") return "คลังไฟล์หลักฐาน";
    return "ระบบงานประกันคุณภาพ";
  };

  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        display: "flex",
        height: 64,
        width: "100%",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(8px)",
        px: { xs: 2, sm: 3 },
      }}
    >
      {/* Left side: Mobile Toggle & Page Title */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <IconButton
          onClick={toggleMobile}
          sx={{ display: { xs: "inline-flex", md: "none" } }}
          size="small"
          aria-label="เปิดเมนูนำทาง"
        >
          <MenuIcon fontSize="small" />
        </IconButton>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            color: "text.primary",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {getPageTitle()}
        </Typography>
      </Box>

      {/* Right side: Academic Term Selector + Profile Avatar */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        {/* Global Academic Year / Term Selector */}
        <Button
          variant="outlined"
          size="small"
          onClick={(e) => setTermAnchorEl(e.currentTarget)}
          startIcon={<CalendarTodayIcon sx={{ fontSize: 16 }} />}
          endIcon={<ExpandMoreIcon sx={{ fontSize: 16 }} />}
          sx={{
            borderColor: "primary.light",
            bgcolor: "primary.50",
            color: "primary.main",
            fontWeight: 600,
            py: 0.5,
            px: 1.5,
            borderRadius: 2,
          }}
        >
          <Box component="span" sx={{ display: { xs: "none", sm: "inline" }, mr: 0.5 }}>
            ปีการศึกษา
          </Box>
          {selectedYear}
          <Chip
            size="small"
            label={availableSemesters.find((s) => s.value === selectedSemester)?.shortLabel || "เทอม 1"}
            color="primary"
            sx={{ ml: 1, height: 20, fontSize: "0.6875rem", fontWeight: 700 }}
          />
        </Button>

        {/* Term Popover Menu */}
        <Menu
          anchorEl={termAnchorEl}
          open={isTermOpen}
          onClose={() => setTermAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            paper: {
              sx: {
                width: 320,
                p: 2,
                mt: 1,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
              },
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                รอบปีการศึกษาและเทอม
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                คัดกรองข้อมูลตามเกณฑ์ประเมิน SAR
              </Typography>
            </Box>
            <Chip size="small" label="กำลังใช้งาน" color="success" variant="outlined" />
          </Box>

          <Divider sx={{ my: 1.5 }} />

          {/* Year Selector */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block", mb: 1 }}>
              เลือกปีการศึกษา
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
              {availableYears.map((year) => {
                const isSelected = selectedYear === year;
                return (
                  <Button
                    key={year}
                    size="small"
                    variant={isSelected ? "contained" : "outlined"}
                    onClick={() => setSelectedYear(year)}
                    startIcon={isSelected ? <CheckIcon sx={{ fontSize: 14 }} /> : undefined}
                    sx={{ minWidth: 0, py: 0.5 }}
                  >
                    {year}
                  </Button>
                );
              })}
            </Box>
          </Box>

          {/* Semester Selector */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block", mb: 1 }}>
              เลือกภาคเรียน
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
              {availableSemesters.map((sem) => {
                const isSelected = selectedSemester === sem.value;
                return (
                  <Button
                    key={sem.value}
                    size="small"
                    variant={isSelected ? "contained" : "outlined"}
                    color={isSelected ? "secondary" : "primary"}
                    onClick={() => setSelectedSemester(sem.value)}
                    startIcon={isSelected ? <CheckIcon sx={{ fontSize: 14 }} /> : undefined}
                    sx={{ minWidth: 0, py: 0.5 }}
                  >
                    {sem.shortLabel}
                  </Button>
                );
              })}
            </Box>
          </Box>

          <Divider sx={{ my: 1.5 }} />

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <AutoAwesomeIcon sx={{ fontSize: 16, color: "primary.main" }} />
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                เลือกไว้ <strong style={{ color: "#0f172a" }}>{shortTermLabel}</strong>
              </Typography>
            </Box>
            <Button size="small" variant="contained" onClick={() => setTermAnchorEl(null)}>
              ตกลง
            </Button>
          </Box>
        </Menu>

        {/* User Profile Menu */}
        {session?.user ? (
          <>
            <Button
              variant="text"
              onClick={(e) => setUserAnchorEl(e.currentTarget)}
              sx={{
                p: 0.5,
                borderRadius: 3,
                color: "text.primary",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Avatar
                src={session.user.avatarUrl || undefined}
                sx={{
                  width: 34,
                  height: 34,
                  bgcolor: "primary.main",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                }}
              >
                {userInitial}
              </Avatar>
              <Box sx={{ display: { xs: "none", lg: "block" }, textAlign: "left" }}>
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  {session.user.name}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1 }}>
                  {session.user.roleTitle || (isRoot ? "ผู้ดูแลระบบสูงสุด" : "บุคลากร")}
                </Typography>
              </Box>
              <ExpandMoreIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            </Button>

            <Menu
              anchorEl={userAnchorEl}
              open={isUserOpen}
              onClose={() => setUserAnchorEl(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              slotProps={{
                paper: {
                  sx: {
                    width: 240,
                    p: 1,
                    mt: 1,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                  },
                },
              }}
            >
              <Box sx={{ px: 1.5, py: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {session.user.name}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                  {session.user.email}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {isRoot ? (
                    <Chip
                      size="small"
                      icon={<SecurityIcon sx={{ fontSize: 14 }} />}
                      label="ผู้ดูแลระบบสูงสุด"
                      color="error"
                      variant="outlined"
                    />
                  ) : (
                    <Chip size="small" label="บุคลากร" color="primary" variant="outlined" />
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 1 }} />

              <MenuItem
                component={Link}
                href="/profile"
                onClick={() => setUserAnchorEl(null)}
                sx={{ borderRadius: 1.5, gap: 1.5, py: 1 }}
              >
                <PersonIcon fontSize="small" sx={{ color: "text.secondary" }} />
                <Typography variant="body2">โปรไฟล์ของฉัน</Typography>
              </MenuItem>

              <Divider sx={{ my: 1 }} />

              <MenuItem
                onClick={() => signOut({ callbackUrl: "/login" })}
                sx={{ borderRadius: 1.5, gap: 1.5, py: 1, color: "error.main" }}
              >
                <LogoutIcon fontSize="small" color="error" />
                <Typography variant="body2" sx={{ color: "error.main", fontWeight: 600 }}>
                  ออกจากระบบ
                </Typography>
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Button
            component={Link}
            href="/login"
            variant="contained"
            size="small"
            startIcon={<PersonIcon />}
          >
            เข้าสู่ระบบ
          </Button>
        )}
      </Box>
    </Box>
  );
}
