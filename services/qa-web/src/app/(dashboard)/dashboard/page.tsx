import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Avatar from "@mui/material/Avatar";
import LinearProgress from "@mui/material/LinearProgress";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import WorkIcon from "@mui/icons-material/Work";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SecurityIcon from "@mui/icons-material/Security";
import WarningIcon from "@mui/icons-material/Warning";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import SchoolIcon from "@mui/icons-material/School";
import BoltIcon from "@mui/icons-material/Bolt";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

function calculateAge(birthDateString?: string | Date | null) {
  if (!birthDateString) return null;
  const birth = new Date(birthDateString);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const user = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          roleDefinition: true,
          teacherLicenses: {
            orderBy: { issuedDate: "desc" },
          },
        },
      })
    : null;

  const isRoot = session?.user?.role === "ROOT";
  const userPermissions = session?.user?.permissions || ["/dashboard"];
  const canManageUsers = isRoot || userPermissions.includes("/admin/users");

  const [userCount, roleCount, totalActiveTeachers, validLicenseCount, expiringCount] = await Promise.all([
    canManageUsers ? prisma.user.count() : 0,
    canManageUsers ? prisma.roleDefinition.count() : 0,
    canManageUsers ? prisma.user.count({ where: { isActive: true } }) : 0,
    canManageUsers
      ? prisma.teacherLicense.count({
          where: {
            status: { in: ["ACTIVE", "EXPIRING_SOON"] },
            expiredDate: { gte: new Date() },
          },
        })
      : 0,
    canManageUsers
      ? prisma.teacherLicense.count({
          where: {
            OR: [
              { status: "EXPIRING_SOON" },
              {
                expiredDate: {
                  gte: new Date(),
                  lte: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
                },
              },
            ],
          },
        })
      : 0,
  ]);

  const sarLicensePercentage =
    totalActiveTeachers > 0 ? Math.round((validLicenseCount / totalActiveTeachers) * 100) : 0;

  // Personal Teacher License Status Check
  let licenseAlert: {
    severity: "warning" | "error" | "info";
    title: string;
    description: string;
    actionLabel: string;
    showKspLink?: boolean;
  } | null = null;

  if (user) {
    const kspLicense = user.teacherLicenses?.find((l) =>
      ["KSP_A_LICENSE", "KSP_B_LICENSE", "KSP_P_LICENSE", "KSP_PROVISIONAL"].includes(l.licenseType)
    );

    if (!kspLicense) {
      licenseAlert = {
        severity: "warning",
        title: "ยังไม่ได้บันทึกข้อมูลใบอนุญาตประกอบวิชาชีพทางการศึกษา",
        description: "กรุณากรอกข้อมูลและแนบไฟล์หลักฐานเพื่อใช้ในรายงานประเมินตนเอง SAR",
        actionLabel: "กรอกข้อมูลคุรุสภา",
      };
    } else if (kspLicense.licenseType === "KSP_PROVISIONAL" && kspLicense.provisionalRound === 3) {
      licenseAlert = {
        severity: "error",
        title: "หนังสือผ่อนผันคุรุสภาครั้งที่ 3 ครั้งสุดท้ายตามระเบียบ",
        description: "กรุณาเร่งสำเร็จคุณวุฒิครู หรือสอบผ่านเกณฑ์เพื่อขอใบอนุญาตก่อนหนังสือผ่อนผันหมดอายุ",
        actionLabel: "ตรวจสอบในโปรไฟล์",
        showKspLink: true,
      };
    } else if (kspLicense.status === "IN_RENEWAL") {
      licenseAlert = {
        severity: "info",
        title: "อยู่ระหว่างการยื่นขอต่ออายุใบอนุญาต",
        description: "ระบบกำลังรอการอนุมัติเอกสารและผลการต่ออายุจากคุรุสภา",
        actionLabel: "ตรวจสอบในโปรไฟล์",
        showKspLink: true,
      };
    } else if (kspLicense.status === "EXPIRED" || (kspLicense.expiredDate && new Date(kspLicense.expiredDate) < new Date())) {
      licenseAlert = {
        severity: "error",
        title: "ใบอนุญาตประกอบวิชาชีพทางการศึกษาหมดอายุแล้ว",
        description: "กรุณาดำเนินการต่ออายุผ่านระบบ KSP Self Service และอัปเดตข้อมูลในระบบ",
        actionLabel: "ตรวจสอบในโปรไฟล์",
        showKspLink: true,
      };
    } else if (
      kspLicense.status === "EXPIRING_SOON" ||
      (kspLicense.expiredDate &&
        new Date(kspLicense.expiredDate) <= new Date(Date.now() + 180 * 24 * 60 * 60 * 1000))
    ) {
      const days = Math.max(
        0,
        Math.ceil(
          (new Date(kspLicense.expiredDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
      );
      licenseAlert = {
        severity: "warning",
        title: `ใบอนุญาตประกอบวิชาชีพจะหมดอายุในอีก ${days} วัน`,
        description: "กรุณายื่นคำขอต่ออายุล่วงหน้าไม่น้อยกว่า 180 วันตามข้อบังคับคุรุสภา",
        actionLabel: "ตรวจสอบในโปรไฟล์",
        showKspLink: true,
      };
    }
  }

  const roleTitle = user?.roleDefinition?.title || (isRoot ? "ผู้ดูแลระบบสูงสุด" : "บุคลากรวิทยาลัย");
  const age = calculateAge(user?.birthDate);

  return (
    <Box sx={{ p: { xs: 1.25, sm: 2 }, maxWidth: 1300, mx: "auto", display: "flex", flexDirection: "column", gap: 1.5 }}>
      {/* 0. License Alert using MUI Alert */}
      {licenseAlert && (
        <Alert
          severity={licenseAlert.severity}
          action={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {licenseAlert.showKspLink && (
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  href="https://ksp-selfservice.ksp.or.th"
                  target="_blank"
                  rel="noopener noreferrer"
                  endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                  sx={{ display: { xs: "none", sm: "inline-flex" } }}
                >
                  KSP Self Service
                </Button>
              )}
              <Link href="/profile" style={{ textDecoration: "none" }}>
                <Button
                  size="small"
                  variant="contained"
                  color={licenseAlert.severity}
                  sx={{ fontWeight: 700, px: 1.5, py: 0.25, fontSize: "0.75rem" }}
                >
                  {licenseAlert.actionLabel}
                </Button>
              </Link>
            </Box>
          }
          sx={{ py: 0.5 }}
        >
          <AlertTitle sx={{ fontWeight: 700, fontSize: "0.875rem", mb: 0.25 }}>{licenseAlert.title}</AlertTitle>
          <Typography variant="body2" sx={{ fontSize: "0.8125rem" }}>{licenseAlert.description}</Typography>
        </Alert>
      )}

      {/* 1. Streamlined Compact Profile & Quick Actions Bar */}
      <Paper sx={{ px: 2, py: 1.25 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            gap: 1.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              src={user?.avatarUrl || undefined}
              sx={{
                width: 44,
                height: 44,
                bgcolor: "primary.main",
                fontSize: "1.1rem",
                fontWeight: 700,
              }}
            >
              {user?.name ? user.name.charAt(0) : "U"}
            </Avatar>

            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="h2" sx={{ fontSize: "1.0625rem", fontWeight: 700, color: "text.primary" }}>
                  {user?.name || session?.user?.name || "ผู้ใช้งาน"}
                </Typography>
                <Chip
                  size="small"
                  label={roleTitle}
                  color={isRoot ? "error" : "primary"}
                  variant="outlined"
                  sx={{ height: 20, fontSize: "0.6875rem" }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.75rem" }}>
                {user?.position || "บุคลากรวิทยาลัย"} • {user?.email || session?.user?.email}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, alignSelf: { xs: "stretch", md: "auto" } }}>
            <Link href="/dashboard/students" style={{ textDecoration: "none" }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<SchoolIcon sx={{ fontSize: 16 }} />}
                sx={{ px: 1.25, py: 0.4, fontSize: "0.75rem" }}
              >
                สลับไปงานนักเรียน
              </Button>
            </Link>
            <Link href="/quick-upload" style={{ textDecoration: "none" }}>
              <Button
                size="small"
                variant="contained"
                startIcon={<BoltIcon sx={{ fontSize: 16 }} />}
                sx={{ px: 1.25, py: 0.4, fontSize: "0.75rem", fontWeight: 600 }}
              >
                อัปโหลดหลักฐาน
              </Button>
            </Link>
          </Box>
        </Box>
      </Paper>

      {/* 2. Personnel Details Grid */}
      <Paper sx={{ p: 2.5 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          ข้อมูลส่วนตัวและตำแหน่งงาน
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
            gap: 1.5,
          }}
        >
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "background.default", border: "1px solid", borderColor: "divider" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary", mb: 0.5 }}>
              <WorkIcon sx={{ fontSize: 16 }} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>ตำแหน่งงาน</Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
              {user?.position || "ยังไม่ได้ระบุ"}
            </Typography>
          </Box>

          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "background.default", border: "1px solid", borderColor: "divider" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary", mb: 0.5 }}>
              <PhoneIcon sx={{ fontSize: 16 }} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>เบอร์โทรศัพท์</Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
              {user?.phone ? (
                <a href={`tel:${user.phone}`} style={{ color: "#1e40af", textDecoration: "none" }}>
                  {user.phone}
                </a>
              ) : (
                "ยังไม่ได้ระบุ"
              )}
            </Typography>
          </Box>

          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "background.default", border: "1px solid", borderColor: "divider" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary", mb: 0.5 }}>
              <CalendarTodayIcon sx={{ fontSize: 16 }} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>วันเดือนปีเกิด</Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
              {user?.birthDate
                ? new Date(user.birthDate).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "ยังไม่ได้ระบุ"}
            </Typography>
          </Box>

          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "background.default", border: "1px solid", borderColor: "divider" }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block", mb: 0.5 }}>
              อายุคำนวณอัตโนมัติ
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
              {age !== null ? `${age} ปี` : "ยังไม่ได้ระบุ"}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* 3. SAR Quality Metrics */}
      {canManageUsers && (
        <Paper sx={{ p: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Box>
              <Typography variant="h4">
                มาตรฐานด้านคุณวุฒิและมาตรฐานวิชาชีพครู
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                เกณฑ์การประเมินคุณภาพการศึกษา สอศ และคุรุสภา
              </Typography>
            </Box>
            <Chip size="small" label="ตัวชี้วัดความพร้อม SAR" color="success" variant="outlined" />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
              gap: 2,
            }}
          >
            {/* Metric 1 */}
            <Paper sx={{ p: 2, bgcolor: "background.default" }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block", mb: 0.5 }}>
                ร้อยละครูที่มีใบอนุญาตถูกต้อง
              </Typography>
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 1 }}>
                <Typography variant="h1" sx={{ color: "primary.main" }}>
                  {sarLicensePercentage}%
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {validLicenseCount}/{totalActiveTeachers} ท่าน
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={sarLicensePercentage} sx={{ height: 6, borderRadius: 3 }} />
            </Paper>

            {/* Metric 2 */}
            <Paper sx={{ p: 2, bgcolor: "background.default" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
                <CheckCircleIcon sx={{ fontSize: 16, color: "success.main" }} />
                <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
                  ใบอนุญาตพร้อมใช้งาน
                </Typography>
              </Box>
              <Typography variant="h2" sx={{ color: "text.primary", mb: 0.5 }}>
                {validLicenseCount} คน
              </Typography>
              <Typography variant="caption" sx={{ color: "success.main", fontWeight: 600 }}>
                ผ่านเกณฑ์มาตรฐานวิชาชีพ
              </Typography>
            </Paper>

            {/* Metric 3 */}
            <Paper sx={{ p: 2, bgcolor: "background.default" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
                <AccessTimeIcon sx={{ fontSize: 16, color: "warning.main" }} />
                <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
                  ใกล้หมดอายุ หรือต้องต่ออายุ
                </Typography>
              </Box>
              <Typography variant="h2" sx={{ color: "warning.main", mb: 0.5 }}>
                {expiringCount} คน
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                หมดอายุภายใน 180 วัน
              </Typography>
            </Paper>
          </Box>
        </Paper>
      )}

      {/* 4. System Statistics */}
      {canManageUsers && (
        <Paper sx={{ p: 2.5, bgcolor: "primary.50", borderColor: "primary.light" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main", textTransform: "uppercase" }}>
                การบริหารระบบ
              </Typography>
              <Typography variant="h3" sx={{ color: "primary.dark", mt: 0.5 }}>
                จัดการบัญชีและสิทธิ์บุคลากร
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                มีผู้ใช้งานทั้งหมด {userCount} บัญชี แบ่งเป็น {roleCount} บทบาทหน้าที่
              </Typography>
            </Box>

            <Link href="/admin/users" style={{ textDecoration: "none" }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<VerifiedUserIcon />}
              >
                จัดการผู้ใช้และสิทธิ์
              </Button>
            </Link>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
