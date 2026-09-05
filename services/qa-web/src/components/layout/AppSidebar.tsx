"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SchoolIcon from "@mui/icons-material/School";
import BoltIcon from "@mui/icons-material/Bolt";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import PersonIcon from "@mui/icons-material/Person";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import GroupsIcon from "@mui/icons-material/Groups";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import FlagIcon from "@mui/icons-material/Flag";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import BadgeIcon from "@mui/icons-material/Badge";
import DnsIcon from "@mui/icons-material/Dns";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SecurityIcon from "@mui/icons-material/Security";
import DateRangeIcon from "@mui/icons-material/DateRange";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import ApartmentIcon from "@mui/icons-material/Apartment";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useSidebar } from "./SidebarContext";
import { useAcademicYear } from "./AcademicYearContext";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ sx?: any }>;
  show: boolean;
  badge?: string;
}

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

export function AppSidebar({
  isMobile = false,
  className,
}: {
  isMobile?: boolean;
  className?: string;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isCollapsed, toggleCollapse, setMobileOpen } = useSidebar();
  const { shortTermLabel } = useAcademicYear();

  const isRoot = session?.user?.role === "ROOT";
  const userPermissions = (session?.user as any)?.permissions || ["/dashboard"];
  const canManageUsers = isRoot || userPermissions.includes("/admin/users") || userPermissions.includes("admin.users");
  const canManageRoles = isRoot || userPermissions.includes("/admin/users") || userPermissions.includes("admin.roles");
  const canManageAcademicYears = isRoot || userPermissions.includes("/admin/users") || userPermissions.includes("academic_year.manage");
  const canManageCurriculum = isRoot || userPermissions.includes("/admin/users") || userPermissions.includes("curriculum.manage");
  const canManageLicenses =
    isRoot || userPermissions.includes("/admin/licenses") || userPermissions.includes("/admin/users") || userPermissions.includes("admin.licenses");
  const canManageCourses =
    isRoot ||
    userPermissions.includes("/admin/courses") ||
    userPermissions.includes("/admin/users") ||
    userPermissions.includes("curriculum.manage") ||
    (session?.user as any)?.role === "DEPT_HEAD";
  const canManageDepartment =
    isRoot ||
    userPermissions.includes("/admin/department") ||
    userPermissions.includes("admin.department") ||
    userPermissions.includes("/admin/users") ||
    (session?.user as any)?.role === "DEPT_HEAD";
  const canAccessDashboard = isRoot || userPermissions.includes("/dashboard");

  const userInitial = session?.user?.name ? session.user.name.charAt(0) : "U";
  const effectiveCollapsed = isMobile ? false : isCollapsed;

  const navGroups: NavGroup[] = [
    {
      groupTitle: "ภาพรวมระบบ",
      items: [
        {
          title: "ภาพรวมงานครูและบุคลากร",
          href: "/dashboard",
          icon: DashboardIcon,
          show: canAccessDashboard,
        },
        {
          title: "ภาพรวมงานนักเรียนและนักศึกษา",
          href: "/dashboard/students",
          icon: SchoolIcon,
          show: canAccessDashboard,
          badge: "ใหม่",
        },
      ],
    },
    {
      groupTitle: "คลังหลักฐานและอัปโหลด",
      items: [
        {
          title: "ทางลัดอัปโหลดด่วน",
          href: "/quick-upload",
          icon: BoltIcon,
          show: true,
          badge: "ด่วน",
        },
        {
          title: "คลังไฟล์หลักฐาน",
          href: "/stock",
          icon: FolderSpecialIcon,
          show: true,
        },
      ],
    },
    {
      groupTitle: "ระบบงานครูและบุคลากร",
      items: [
        {
          title: "โปรไฟล์และผลงานครู",
          href: "/profile",
          icon: PersonIcon,
          show: true,
        },
        {
          title: "แผนการสอนและหลังสอน",
          href: "/teachers/lesson-plans",
          icon: MenuBookIcon,
          show: true,
        },
        {
          title: "การพัฒนาวิชาชีพและอบรม",
          href: "/teachers/trainings",
          icon: WorkspacePremiumIcon,
          show: true,
        },
        {
          title: "งานวิจัยและสิ่งประดิษฐ์",
          href: "/teachers/researches",
          icon: LightbulbIcon,
          show: true,
        },
      ],
    },
    {
      groupTitle: "ระบบงานนักเรียนและนักศึกษา",
      items: [
        {
          title: "ทะเบียนข้อมูลนักเรียน",
          href: "/students",
          icon: GroupsIcon,
          show: true,
        },
        {
          title: "เช็คชื่อเข้าเรียนและพฤติกรรม",
          href: "/students/attendance",
          icon: FactCheckIcon,
          show: true,
        },
        {
          title: "ผลสัมฤทธิ์และสมรรถนะ",
          href: "/students/competencies",
          icon: EmojiEventsIcon,
          show: true,
        },
        {
          title: "กิจกรรมผู้เรียนและหน้าเสาธง",
          href: "/students/activities",
          icon: FlagIcon,
          show: true,
        },
      ],
    },
    {
      groupTitle: "การบริหารระบบและสิทธิ์",
      items: [
        {
          title: "จัดการบัญชีผู้ใช้งาน",
          href: "/admin/users",
          icon: VerifiedUserIcon,
          show: canManageUsers,
        },
        {
          title: "กำหนดยศและสิทธิ์ (Matrix)",
          href: "/admin/roles",
          icon: SecurityIcon,
          show: canManageRoles,
          badge: isRoot ? "ROOT" : undefined,
        },
        {
          title: "รอบปีการศึกษาและเทอม",
          href: "/admin/academic-years",
          icon: DateRangeIcon,
          show: canManageAcademicYears,
        },
        {
          title: "ข้อมูลชั้นเรียนและสาขา",
          href: "/admin/curriculum",
          icon: MeetingRoomIcon,
          show: canManageCurriculum,
        },
        {
          title: "มอบหมายรายวิชาสอน",
          href: "/admin/courses",
          icon: AssignmentIndIcon,
          show: canManageCourses,
        },
        {
          title: "ข้อมูลและบริบทแผนกวิชา",
          href: "/admin/department",
          icon: ApartmentIcon,
          show: canManageDepartment,
        },
        {
          title: "ประเภทใบอนุญาตและมาตรฐาน",
          href: "/admin/licenses",
          icon: BadgeIcon,
          show: canManageLicenses,
        },
        {
          title: "ตั้งค่าระบบและมอนิเตอร์",
          href: "/admin/system",
          icon: DnsIcon,
          show: isRoot,
          badge: "ROOT",
        },
      ],
    },
  ];

  const handleLinkClick = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  return (
    <Box
      component="aside"
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRight: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        transition: "width 0.2s ease-in-out",
        userSelect: "none",
        width: isMobile ? 280 : effectiveCollapsed ? 76 : 280,
        height: isMobile ? "100%" : "100vh",
        p: effectiveCollapsed ? 1.5 : 2.5,
      }}
      className={className}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "calc(100% - 70px)" }}>
        {/* Top Header: Logo & Collapse Button */}
        <Box
          sx={{
            display: "flex",
            height: 48,
            alignItems: "center",
            justifyContent: effectiveCollapsed ? "center" : "space-between",
            pb: 1.5,
            borderBottom: "1px solid",
            borderColor: "divider",
            mb: 1.5,
          }}
        >
          <Box
            component={Link}
            href="/dashboard"
            onClick={handleLinkClick}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              textDecoration: "none",
              color: "inherit",
            }}
            title="TechSAR หน้าหลัก"
          >
            <Box
              component="img"
              src="/logo.svg"
              alt="TechSAR Logo"
              sx={{ width: 34, height: 34, objectFit: "contain", flexShrink: 0 }}
            />

            {!effectiveCollapsed && (
              <Box sx={{ overflow: "hidden", whiteSpace: "nowrap" }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 800, color: "primary.dark", lineHeight: 1 }}
                >
                  TechSAR
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontWeight: 500, display: "block", mt: 0.5 }}
                >
                  ระบบประกันคุณภาพตามเกณฑ์ SAR
                </Typography>
              </Box>
            )}
          </Box>

          {!isMobile && !effectiveCollapsed && (
            <IconButton
              size="small"
              onClick={toggleCollapse}
              aria-label="ย่อแถบเมนู"
              sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}
            >
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        {/* Expand button when collapsed */}
        {!isMobile && effectiveCollapsed && (
          <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
            <IconButton
              size="small"
              onClick={toggleCollapse}
              aria-label="ขยายแถบเมนู"
              sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}
            >
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

        {/* Active Term Indicator */}
        {!effectiveCollapsed && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 1.5,
              py: 1,
              mb: 1.5,
              borderRadius: 2,
              bgcolor: "background.default",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
              <CalendarTodayIcon sx={{ fontSize: 14, color: "primary.main" }} />
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: "text.primary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                {shortTermLabel}
              </Typography>
            </Box>
            <Chip size="small" label="SAR" color="primary" sx={{ height: 18, fontSize: "0.625rem" }} />
          </Box>
        )}

        {/* Scrollable Navigation Menu */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            pr: 0.5,
            "&::-webkit-scrollbar": { width: 4 },
            "&::-webkit-scrollbar-thumb": { bgcolor: "divider", borderRadius: 2 },
          }}
        >
          {navGroups.map((group, groupIdx) => {
            const visibleItems = group.items.filter((item) => item.show);
            if (visibleItems.length === 0) return null;

            return (
              <Box key={groupIdx} sx={{ mb: 1.5 }}>
                {!effectiveCollapsed ? (
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      px: 1.5,
                      pt: 1,
                      pb: 0.5,
                      fontWeight: 700,
                      color: "text.secondary",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {group.groupTitle}
                  </Typography>
                ) : (
                  <Divider sx={{ my: 1 }} />
                )}

                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
                  {visibleItems.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/dashboard" && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    const navLink = (
                      <Box
                        component={Link}
                        key={item.href}
                        href={item.href}
                        onClick={handleLinkClick}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          borderRadius: 2,
                          py: 0.85,
                          px: effectiveCollapsed ? 1 : 1.5,
                          justifyContent: effectiveCollapsed ? "center" : "flex-start",
                          textDecoration: "none",
                          fontWeight: isActive ? 600 : 500,
                          fontSize: "0.8125rem",
                          color: isActive ? "#ffffff" : "text.primary",
                          bgcolor: isActive ? "primary.main" : "transparent",
                          transition: "all 0.15s ease",
                          "&:hover": {
                            bgcolor: isActive ? "primary.dark" : "action.hover",
                          },
                        }}
                      >
                        <Icon
                          sx={{
                            fontSize: 18,
                            color: isActive ? "#ffffff" : "text.secondary",
                            flexShrink: 0,
                          }}
                        />

                        {!effectiveCollapsed && (
                          <Typography
                            variant="body2"
                            sx={{
                              flex: 1,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              color: "inherit",
                              fontWeight: "inherit",
                            }}
                          >
                            {item.title}
                          </Typography>
                        )}

                        {!effectiveCollapsed && item.badge && (
                          <Chip
                            size="small"
                            label={item.badge}
                            sx={{
                              height: 18,
                              fontSize: "0.625rem",
                              fontWeight: 700,
                              bgcolor: isActive
                                ? "rgba(255, 255, 255, 0.2)"
                                : item.badge === "ใหม่"
                                ? "success.50"
                                : item.badge === "ROOT"
                                ? "error.50"
                                : "primary.50",
                              color: isActive
                                ? "#ffffff"
                                : item.badge === "ใหม่"
                                ? "success.main"
                                : item.badge === "ROOT"
                                ? "error.main"
                                : "primary.main",
                            }}
                          />
                        )}
                      </Box>
                    );

                    return effectiveCollapsed ? (
                      <Tooltip key={item.href} title={item.title} placement="right">
                        {navLink}
                      </Tooltip>
                    ) : (
                      navLink
                    );
                  })}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Bottom User Profile Section */}
      <Box sx={{ pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
        {session?.user ? (
          <Box
            component={Link}
            href="/profile"
            onClick={handleLinkClick}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              p: 1,
              borderRadius: 2.5,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.default",
              textDecoration: "none",
              color: "inherit",
              justifyContent: effectiveCollapsed ? "center" : "space-between",
              "&:hover": {
                borderColor: "primary.light",
                bgcolor: "background.paper",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, overflow: "hidden" }}>
              <Avatar
                src={session.user.avatarUrl || undefined}
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "primary.main",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {userInitial}
              </Avatar>

              {!effectiveCollapsed && (
                <Box sx={{ overflow: "hidden", textAlign: "left" }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: "text.primary",
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {session.user.name}
                  </Typography>
                  <Chip
                    size="small"
                    label={isRoot ? "ROOT" : session.user.roleTitle || "บุคลากร"}
                    color={isRoot ? "error" : "primary"}
                    variant="outlined"
                    sx={{ height: 16, fontSize: "0.5625rem", fontWeight: 700, mt: 0.25 }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        ) : (
          <Button
            component={Link}
            href="/login"
            variant="contained"
            size="small"
            fullWidth
            startIcon={<PersonIcon />}
          >
            {!effectiveCollapsed ? "เข้าสู่ระบบ" : ""}
          </Button>
        )}
      </Box>
    </Box>
  );
}
