"use client";

import React, { useMemo } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import MuiLink from "@mui/material/Link";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import SchoolIcon from "@mui/icons-material/School";
import GroupsIcon from "@mui/icons-material/Groups";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PersonIcon from "@mui/icons-material/Person";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface PageBreadcrumbsProps {
  items?: BreadcrumbItem[];
}

interface RouteConfig {
  section?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
  };
  pageTitle: string;
  pageIcon?: React.ReactNode;
}

const ROUTE_CONFIG_MAP: Record<string, RouteConfig> = {
  // Admin Module
  "/admin/users": {
    section: { label: "ผู้ดูแลระบบ", href: "/admin/users", icon: <AdminPanelSettingsIcon sx={{ fontSize: 14 }} /> },
    pageTitle: "จัดการผู้ใช้งานและสิทธิ์",
  },
  "/admin/roles": {
    section: { label: "ผู้ดูแลระบบ", href: "/admin/users", icon: <AdminPanelSettingsIcon sx={{ fontSize: 14 }} /> },
    pageTitle: "จัดการสิทธิ์และบทบาท",
  },
  "/admin/system": {
    section: { label: "ผู้ดูแลระบบ", href: "/admin/users", icon: <AdminPanelSettingsIcon sx={{ fontSize: 14 }} /> },
    pageTitle: "ศูนย์มอนิเตอร์และระบบ",
  },
  "/admin/academic-years": {
    section: { label: "ผู้ดูแลระบบ", href: "/admin/users", icon: <AdminPanelSettingsIcon sx={{ fontSize: 14 }} /> },
    pageTitle: "กำหนดปีการศึกษาและภาคเรียน",
  },
  "/admin/courses": {
    section: { label: "ผู้ดูแลระบบ", href: "/admin/users", icon: <AdminPanelSettingsIcon sx={{ fontSize: 14 }} /> },
    pageTitle: "จัดการรายวิชาและการสอน",
  },
  "/admin/curriculum": {
    section: { label: "ผู้ดูแลระบบ", href: "/admin/users", icon: <AdminPanelSettingsIcon sx={{ fontSize: 14 }} /> },
    pageTitle: "โครงสร้างหลักสูตรและห้องเรียน",
  },
  "/admin/department": {
    section: { label: "ผู้ดูแลระบบ", href: "/admin/users", icon: <AdminPanelSettingsIcon sx={{ fontSize: 14 }} /> },
    pageTitle: "ข้อมูลแผนกและห้องปฏิบัติการ",
  },
  "/admin/licenses": {
    section: { label: "ผู้ดูแลระบบ", href: "/admin/users", icon: <AdminPanelSettingsIcon sx={{ fontSize: 14 }} /> },
    pageTitle: "จัดการประเภทใบอนุญาต",
  },

  // Student Module
  "/dashboard/students": {
    section: { label: "งานนักเรียนและนักศึกษา", href: "/dashboard/students", icon: <GroupsIcon sx={{ fontSize: 14 }} /> },
    pageTitle: "ภาพรวมงานนักเรียนและนักศึกษา",
  },
  "/students": {
    section: { label: "งานนักเรียนและนักศึกษา", href: "/dashboard/students", icon: <GroupsIcon sx={{ fontSize: 14 }} /> },
    pageTitle: "ทะเบียนประวัตินักศึกษา",
  },
  "/students/attendance": {
    section: { label: "งานนักเรียนและนักศึกษา", href: "/dashboard/students", icon: <GroupsIcon sx={{ fontSize: 14 }} /> },
    pageTitle: "เช็คชื่อเข้าเรียนและพฤติกรรม",
  },
  "/students/competencies": {
    section: { label: "งานนักเรียนและนักศึกษา", href: "/dashboard/students", icon: <GroupsIcon sx={{ fontSize: 14 }} /> },
    pageTitle: "ผลสัมฤทธิ์และสมรรถนะวิชาชีพ",
  },
  "/students/activities": {
    section: { label: "งานนักเรียนและนักศึกษา", href: "/dashboard/students", icon: <GroupsIcon sx={{ fontSize: 14 }} /> },
    pageTitle: "กิจกรรมผู้เรียนและหน้าเสาธง",
  },

  // Teacher Module
  "/teachers/lesson-plans": {
    section: { label: "งานครูและวิชาการ", href: "/dashboard", icon: <SchoolIcon sx={{ fontSize: 14 }} /> },
    pageTitle: "แผนการจัดการเรียนรู้",
  },
  "/teachers/trainings": {
    section: { label: "งานครูและวิชาการ", href: "/dashboard", icon: <SchoolIcon sx={{ fontSize: 14 }} /> },
    pageTitle: "การพัฒนาวิชาชีพและอบรม",
  },
  "/teachers/researches": {
    section: { label: "งานครูและวิชาการ", href: "/dashboard", icon: <SchoolIcon sx={{ fontSize: 14 }} /> },
    pageTitle: "งานวิจัยและสิ่งประดิษฐ์",
  },

  // Stock & Utility
  "/stock": {
    pageTitle: "คลังไฟล์และร่องรอยหลักฐาน",
    pageIcon: <FolderSpecialIcon sx={{ fontSize: 14 }} />,
  },
  "/quick-upload": {
    pageTitle: "ทางลัดอัปโหลดด่วน",
    pageIcon: <CloudUploadIcon sx={{ fontSize: 14 }} />,
  },
  "/profile": {
    pageTitle: "โปรไฟล์และประวัติการทำงาน",
    pageIcon: <PersonIcon sx={{ fontSize: 14 }} />,
  },
};

export function PageBreadcrumbs({ items }: PageBreadcrumbsProps) {
  const pathname = usePathname();

  // Resolve breadcrumb sequence
  const resolvedItems = useMemo<BreadcrumbItem[]>(() => {
    // 1. Root item is always "หน้าหลัก" (/dashboard)
    const rootItem: BreadcrumbItem = {
      label: "หน้าหลัก",
      href: "/dashboard",
      icon: <HomeOutlinedIcon sx={{ fontSize: 14 }} />,
    };

    // If custom items are passed, sanitize and clean duplicates
    if (items && items.length > 0) {
      // Filter out any redundant "หน้าหลัก" or "/dashboard" entries
      const cleanedCustom = items.filter(
        (it) => it.label !== "หน้าหลัก" && it.href !== "/dashboard"
      );
      return [rootItem, ...cleanedCustom];
    }

    // 2. Auto-resolve from pathname
    if (!pathname) return [rootItem];

    // Check exact match in route map
    const routeConfig = ROUTE_CONFIG_MAP[pathname];
    if (routeConfig) {
      const result: BreadcrumbItem[] = [rootItem];
      if (routeConfig.section) {
        result.push(routeConfig.section);
      }
      result.push({
        label: routeConfig.pageTitle,
        icon: routeConfig.pageIcon,
      });
      return result;
    }

    // Dynamic routes fallback (e.g. /profile/[id])
    if (pathname.startsWith("/profile/")) {
      return [
        rootItem,
        { label: "ผู้ดูแลระบบ", href: "/admin/users", icon: <AdminPanelSettingsIcon sx={{ fontSize: 14 }} /> },
        { label: "โปรไฟล์ผู้ใช้งาน", icon: <PersonIcon sx={{ fontSize: 14 }} /> },
      ];
    }

    if (pathname.startsWith("/students/")) {
      return [
        rootItem,
        { label: "งานนักเรียนและนักศึกษา", href: "/dashboard/students", icon: <GroupsIcon sx={{ fontSize: 14 }} /> },
        { label: "ข้อมูลนักศึกษา" },
      ];
    }

    if (pathname.startsWith("/admin/")) {
      return [
        rootItem,
        { label: "ผู้ดูแลระบบ", href: "/admin/users", icon: <AdminPanelSettingsIcon sx={{ fontSize: 14 }} /> },
        { label: "การตั้งค่าระบบ" },
      ];
    }

    return [rootItem];
  }, [items, pathname]);

  // If there's only root (e.g. on /dashboard), don't show solitary breadcrumb
  if (resolvedItems.length <= 1) {
    return null;
  }

  return (
    <Box sx={{ width: "100%", overflowX: "auto", py: 0.25 }}>
      <Breadcrumbs
        separator={<NavigateNextIcon sx={{ fontSize: 13, color: "text.disabled", mx: -0.25 }} />}
        aria-label="breadcrumb"
        sx={{
          "& .MuiBreadcrumbs-ol": {
            alignItems: "center",
            flexWrap: "nowrap",
          },
          "& .MuiBreadcrumbs-li": {
            display: "inline-flex",
            alignItems: "center",
          },
        }}
      >
        {resolvedItems.map((item, index) => {
          const isLast = index === resolvedItems.length - 1;

          if (isLast || !item.href) {
            return (
              <Box
                key={`${item.label}-${index}`}
                aria-current="page"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "text.primary",
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 1,
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.06)"
                      : "rgba(0, 0, 0, 0.04)",
                  whiteSpace: "nowrap",
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </Box>
            );
          }

          return (
            <MuiLink
              key={`${item.label}-${index}`}
              component={NextLink}
              href={item.href}
              underline="none"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                fontSize: "0.75rem",
                fontWeight: 500,
                color: "text.secondary",
                px: 0.75,
                py: 0.25,
                borderRadius: 1,
                whiteSpace: "nowrap",
                cursor: "pointer",
                transition: "all 0.15s ease-in-out",
                "&:hover": {
                  color: "primary.main",
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.08)"
                      : "rgba(0, 0, 0, 0.05)",
                },
                "&:active": {
                  transform: "scale(0.98)",
                },
                "&:focus-visible": {
                  outline: "2px solid",
                  outlineColor: "primary.main",
                },
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </MuiLink>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
}

