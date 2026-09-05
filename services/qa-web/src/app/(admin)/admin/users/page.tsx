"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Checkbox from "@mui/material/Checkbox";
import Grid from "@mui/material/Grid";

import GroupIcon from "@mui/icons-material/Group";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SecurityIcon from "@mui/icons-material/Security";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import PhoneIcon from "@mui/icons-material/Phone";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import WorkIcon from "@mui/icons-material/Work";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import AddIcon from "@mui/icons-material/Add";
import DashboardIcon from "@mui/icons-material/Dashboard";
import VisibilityIcon from "@mui/icons-material/Visibility";
import BadgeIcon from "@mui/icons-material/Badge";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { ImageUpload } from "@/components/ui/ImageUpload";

interface RoleDef {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  color: string;
  permissions: string[];
  isSystem: boolean;
  _count?: {
    users: number;
  };
}

interface UserData {
  id: string;
  name: string;
  email: string;
  roleCode: string;
  roleDefinitionId?: string | null;
  roleDefinition?: {
    id: string;
    code: string;
    title: string;
    color: string;
    permissions: string[];
  } | null;
  position?: string | null;
  phone?: string | null;
  birthDate?: string | null;
  avatarUrl?: string | null;
  isActive: boolean;
  createdAt: string;
}

interface PermissionGroup {
  category: string;
  items: {
    key: string;
    title: string;
    description: string;
    icon: React.ElementType;
  }[];
}

const AVAILABLE_PERMISSION_GROUPS: PermissionGroup[] = [
  {
    category: "1. การเข้าถึงหน้าระบบ (Page Access)",
    items: [
      {
        key: "/dashboard",
        title: "หน้าหลักบุคลากร (Dashboard)",
        description: "เข้าถึงภาพรวมระบบและข้อมูลส่วนตัว",
        icon: DashboardIcon,
      },
      {
        key: "/admin/users",
        title: "จัดการผู้ใช้และสิทธิ์ (User & Role Management)",
        description: "จัดการบัญชีบุคลากร กำหนดยศ และสิทธิ์การเข้าถึง",
        icon: GroupIcon,
      },
      {
        key: "/admin/licenses",
        title: "จัดการประเภทใบอนุญาต (License Types & Standards)",
        description: "จัดการประเภทใบอนุญาต คุรุสภา TPQI DSD กว. และตัวเลือกแนะนำ",
        icon: BadgeIcon,
      },
    ],
  },
  {
    category: "2. สิทธิ์โปรไฟล์บุคลากร (Staff Profile Permissions)",
    items: [
      {
        key: "profile.view_all",
        title: "ดูโปรไฟล์ของบุคลากรทุกคนได้ (Read Only Social View)",
        description: "สามารถเปิดดูโปรไฟล์ วุฒิ ประวัติ ทักษะ และกิจกรรมของบุคลากรท่านอื่นได้",
        icon: VisibilityIcon,
      },
      {
        key: "profile.edit_all",
        title: "แก้ไขโปรไฟล์ของบุคลากรท่านอื่นได้ (Edit Others Profile)",
        description: "สามารถแก้ไขข้อมูลส่วนตัว วุฒิ ประวัติ ทักษะ และรูปของบุคลากรท่านอื่นได้",
        icon: EditIcon,
      },
    ],
  },
];

const ALL_PERMISSIONS = AVAILABLE_PERMISSION_GROUPS.flatMap((g) => g.items);

const COLOR_OPTIONS = [
  { value: "teal", label: "สีเขียวหัวเป็ด (Teal)" },
  { value: "blue", label: "สีน้ำเงิน (Blue)" },
  { value: "purple", label: "สีม่วง (Purple)" },
  { value: "emerald", label: "สีเขียว (Emerald)" },
  { value: "amber", label: "สีส้มหรือทอง (Amber)" },
  { value: "indigo", label: "สีคราม (Indigo)" },
  { value: "rose", label: "สีแดง (Rose)" },
  { value: "slate", label: "สีเทา (Slate)" },
];

export default function AdminUsersPage() {
  const { data: session } = useSession();

  // Active Tab: Users or Roles
  const [activeTab, setActiveTab] = useState<number>(0);

  // Users State
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // Roles State
  const [roles, setRoles] = useState<RoleDef[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  // Feedback Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // User Modal State
  const [showUserModal, setShowUserModal] = useState(false);
  const [userModalMode, setUserModalMode] = useState<"create" | "edit">("create");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [userFormSubmitting, setUserFormSubmitting] = useState(false);
  const [userFormData, setUserFormData] = useState({
    name: "",
    email: "",
    password: "",
    roleCode: "STAFF",
    position: "",
    phone: "",
    birthDate: "",
    avatarUrl: "",
  });

  // Role Modal State
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleModalMode, setRoleModalMode] = useState<"create" | "edit">("create");
  const [selectedRole, setSelectedRole] = useState<RoleDef | null>(null);
  const [roleFormSubmitting, setRoleFormSubmitting] = useState(false);
  const [roleFormData, setRoleFormData] = useState({
    title: "",
    code: "",
    description: "",
    color: "blue",
    permissions: ["/dashboard"],
  });

  // Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    content: string;
    onConfirm: () => Promise<void>;
  }>({
    open: false,
    title: "",
    content: "",
    onConfirm: async () => {},
  });

  // Fetch Users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Roles
  const fetchRoles = async () => {
    try {
      setLoadingRoles(true);
      const res = await fetch("/api/admin/roles");
      if (res.ok) {
        const data = await res.json();
        setRoles(data.roles || []);
      }
    } catch (err) {
      console.error("Failed to fetch roles", err);
    } finally {
      setLoadingRoles(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  // Calculate age helper
  const calculateAge = (birthDateString?: string | null) => {
    if (!birthDateString) return null;
    const birthDate = new Date(birthDateString);
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : null;
  };

  // User Actions
  const openCreateUserModal = () => {
    setUserModalMode("create");
    setSelectedUser(null);
    setUserFormData({
      name: "",
      email: "",
      password: "",
      roleCode: roles.length > 0 ? roles.find((r) => r.code === "STAFF")?.code || roles[0].code : "STAFF",
      position: "",
      phone: "",
      birthDate: "",
      avatarUrl: "",
    });
    setShowUserModal(true);
  };

  const openEditUserModal = (user: UserData) => {
    setUserModalMode("edit");
    setSelectedUser(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      password: "",
      roleCode: user.roleCode,
      position: user.position || "",
      phone: user.phone || "",
      birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split("T")[0] : "",
      avatarUrl: user.avatarUrl || "",
    });
    setShowUserModal(true);
  };

  const handleUserFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormSubmitting(true);

    try {
      const url = userModalMode === "create" ? "/api/admin/users" : `/api/admin/users/${selectedUser?.id}`;
      const method = userModalMode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userFormData),
      });

      const data = await res.json();
      if (!res.ok) {
        setSnackbar({
          open: true,
          message: data.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
          severity: "error",
        });
        return;
      }

      setShowUserModal(false);
      setSnackbar({
        open: true,
        message: userModalMode === "create" ? "เพิ่มผู้ใช้งานสำเร็จ" : "บันทึกการแก้ไขสำเร็จ",
        severity: "success",
      });
      fetchUsers();
      fetchRoles();
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
        severity: "error",
      });
    } finally {
      setUserFormSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: UserData) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });

      if (res.ok) {
        setSnackbar({
          open: true,
          message: user.isActive ? "ระงับการใช้งานบัญชีเรียบร้อย" : "เปิดใช้งานบัญชีเรียบร้อย",
          severity: "success",
        });
        fetchUsers();
      } else {
        const data = await res.json();
        setSnackbar({
          open: true,
          message: data.error || "ไม่สามารถเปลี่ยนสถานะผู้ใช้ได้",
          severity: "error",
        });
      }
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "เกิดข้อผิดพลาดในการเชื่อมต่อ",
        severity: "error",
      });
    }
  };

  const handleDeleteUser = (user: UserData) => {
    setConfirmDialog({
      open: true,
      title: "ยืนยันการลบผู้ใช้",
      content: `ต้องการลบผู้ใช้ "${user.name}" (${user.email}) ออกจากระบบหรือไม่ การกระทำนี้ไม่สามารถย้อนกลับได้`,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/users/${user.id}`, {
            method: "DELETE",
          });

          if (res.ok) {
            setSnackbar({
              open: true,
              message: "ลบผู้ใช้เรียบร้อยแล้ว",
              severity: "success",
            });
            fetchUsers();
          } else {
            const data = await res.json();
            setSnackbar({
              open: true,
              message: data.error || "ไม่สามารถลบผู้ใช้ได้",
              severity: "error",
            });
          }
        } catch (err) {
          console.error(err);
          setSnackbar({
            open: true,
            message: "เกิดข้อผิดพลาดในการเชื่อมต่อ",
            severity: "error",
          });
        }
      },
    });
  };

  // Role Actions
  const openCreateRoleModal = () => {
    setRoleModalMode("create");
    setSelectedRole(null);
    setRoleFormData({
      title: "",
      code: "",
      description: "",
      color: "blue",
      permissions: ["/dashboard"],
    });
    setShowRoleModal(true);
  };

  const openEditRoleModal = (role: RoleDef) => {
    setRoleModalMode("edit");
    setSelectedRole(role);
    setRoleFormData({
      title: role.title,
      code: role.code,
      description: role.description || "",
      color: role.color || "blue",
      permissions: role.permissions || ["/dashboard"],
    });
    setShowRoleModal(true);
  };

  const handleRoleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRoleFormSubmitting(true);

    try {
      const url = roleModalMode === "create" ? "/api/admin/roles" : `/api/admin/roles/${selectedRole?.id}`;
      const method = roleModalMode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roleFormData),
      });

      const data = await res.json();
      if (!res.ok) {
        setSnackbar({
          open: true,
          message: data.error || "เกิดข้อผิดพลาดในการบันทึกยศหรือสิทธิ์",
          severity: "error",
        });
        return;
      }

      setShowRoleModal(false);
      setSnackbar({
        open: true,
        message: roleModalMode === "create" ? "สร้างยศใหม่สำเร็จ" : "บันทึกข้อมูลยศสำเร็จ",
        severity: "success",
      });
      fetchRoles();
      fetchUsers();
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
        severity: "error",
      });
    } finally {
      setRoleFormSubmitting(false);
    }
  };

  const handleDeleteRole = (role: RoleDef) => {
    setConfirmDialog({
      open: true,
      title: "ยืนยันการลบยศ",
      content: `ต้องการลบยศ "${role.title}" หรือไม่ ผู้ใช้ในยศนี้อาจได้รับผลกระทบ`,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/roles/${role.id}`, {
            method: "DELETE",
          });

          if (res.ok) {
            setSnackbar({
              open: true,
              message: "ลบยศเรียบร้อยแล้ว",
              severity: "success",
            });
            fetchRoles();
            fetchUsers();
          } else {
            const data = await res.json();
            setSnackbar({
              open: true,
              message: data.error || "ไม่สามารถลบยศนี้ได้",
              severity: "error",
            });
          }
        } catch (err) {
          console.error(err);
          setSnackbar({
            open: true,
            message: "เกิดข้อผิดพลาดในการเชื่อมต่อ",
            severity: "error",
          });
        }
      },
    });
  };

  const togglePermission = (permKey: string) => {
    setRoleFormData((prev) => {
      const exists = prev.permissions.includes(permKey);
      if (exists) {
        return { ...prev, permissions: prev.permissions.filter((p) => p !== permKey) };
      } else {
        return { ...prev, permissions: [...prev.permissions, permKey] };
      }
    });
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.position && u.position.toLowerCase().includes(search.toLowerCase())) ||
      (u.phone && u.phone.includes(search));

    const matchesRole = roleFilter === "ALL" || u.roleCode === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <Box sx={{ width: "100%", maxWidth: 1300, mx: "auto", p: { xs: 1.25, sm: 2 }, display: "flex", flexDirection: "column", gap: 1.5 }}>
      {/* 1. Ultra-Compact Header */}
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
          <Typography variant="h2" sx={{ fontWeight: 700, fontSize: "1.125rem", color: "text.primary" }}>
            จัดการบัญชีผู้ใช้และสิทธิ์การใช้งาน
          </Typography>
          <Tooltip title="กำหนดข้อมูลบุคลากร รูปประจำตัว ควบคุมยศ และสิทธิ์การเข้าถึงแต่ละส่วนของระบบ">
            <IconButton size="small" sx={{ color: "text.secondary", p: 0.25 }}>
              <InfoOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Button
            component={Link}
            href="/admin/roles"
            variant="outlined"
            size="small"
            startIcon={<SecurityIcon sx={{ fontSize: 15 }} />}
            sx={{ px: 1.25, py: 0.35, fontSize: "0.75rem" }}
          >
            Matrix สิทธิ์ละเอียด
          </Button>

          {activeTab === 0 ? (
            <Button
              variant="contained"
              size="small"
              startIcon={<PersonAddIcon sx={{ fontSize: 15 }} />}
              onClick={openCreateUserModal}
              sx={{ px: 1.5, py: 0.35, fontSize: "0.75rem", fontWeight: 600 }}
            >
              เพิ่มผู้ใช้งานใหม่
            </Button>
          ) : (
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon sx={{ fontSize: 15 }} />}
              onClick={openCreateRoleModal}
              sx={{ px: 1.5, py: 0.35, fontSize: "0.75rem", fontWeight: 600 }}
            >
              สร้างยศใหม่
            </Button>
          )}
        </Box>
      </Box>

      {/* 2. Tabs: Users & Roles */}
      <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            px: 2,
            "& .MuiTab-root": {
              minHeight: 48,
              fontWeight: 700,
              fontSize: "0.875rem",
              textTransform: "none",
            },
          }}
        >
          <Tab
            icon={<GroupIcon fontSize="small" />}
            iconPosition="start"
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <span>รายชื่อผู้ใช้งาน</span>
                <Chip label={users.length} size="small" sx={{ height: 20, fontSize: "0.75rem", fontWeight: 700 }} />
              </Box>
            }
          />
          <Tab
            icon={<SecurityIcon fontSize="small" />}
            iconPosition="start"
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <span>ยศและสิทธิ์การใช้งาน</span>
                <Chip label={roles.length} size="small" sx={{ height: 20, fontSize: "0.75rem", fontWeight: 700 }} />
              </Box>
            }
          />
        </Tabs>
      </Paper>

      {/* ================= TAB 0: USERS LIST ================= */}
      {activeTab === 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {/* Filter and Search Bar */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <TextField
              size="small"
              placeholder="ค้นหาชื่อ อีเมล หรือเบอร์โทรศัพท์"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: { xs: "100%", sm: 360 } }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, width: { xs: "100%", sm: "auto" } }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", whiteSpace: "nowrap" }}>
                ยศ
              </Typography>
              <FormControl size="small" sx={{ minWidth: 200, width: { xs: "100%", sm: "auto" } }}>
                <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                  <MenuItem value="ALL">ทุกลำดับยศ (ทั้งหมด)</MenuItem>
                  <MenuItem value="ROOT">ROOT (Super Admin)</MenuItem>
                  {roles.map((r) => (
                    <MenuItem key={r.id} value={r.code}>
                      {r.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Paper>

          {/* Users Table */}
          <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
            {loading ? (
              <Box sx={{ p: 6, display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
                <CircularProgress size={32} />
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  กำลังโหลดข้อมูลผู้ใช้งาน
                </Typography>
              </Box>
            ) : filteredUsers.length === 0 ? (
              <Box sx={{ p: 6, textAlign: "center", color: "text.secondary" }}>
                <GroupIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
                  ไม่พบผู้ใช้งาน
                </Typography>
                <Typography variant="caption">ลองเปลี่ยนคำค้นหาหรือตัวกรองยศ</Typography>
              </Box>
            ) : (
              <Table size="medium">
                <TableHead sx={{ bgcolor: "grey.50" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.75rem" }}>
                      ผู้ใช้งาน
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.75rem" }}>
                      ยศหรือสิทธิ์
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.75rem" }}>
                      ตำแหน่งและข้อมูล
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.75rem" }}>
                      สถานะ
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.75rem" }}>
                      การจัดการ
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const isRootUser = user.roleCode === "ROOT";
                    const userAge = calculateAge(user.birthDate);
                    const userInitial = user.name ? user.name.charAt(0) : "U";

                    return (
                      <TableRow key={user.id} hover>
                        {/* User Avatar & Name */}
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Avatar
                              src={user.avatarUrl || undefined}
                              alt={user.name}
                              sx={{
                                width: 40,
                                height: 40,
                                bgcolor: "primary.main",
                                fontWeight: 700,
                                fontSize: "0.875rem",
                              }}
                            >
                              {userInitial}
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700, color: "text.primary" }}>
                                {user.name}
                              </Typography>
                              <Typography variant="caption" noWrap sx={{ color: "text.secondary", display: "block" }}>
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        {/* Role Chip */}
                        <TableCell>
                          <Chip
                            icon={<VerifiedUserIcon sx={{ fontSize: "1rem !important" }} />}
                            label={user.roleDefinition?.title || (isRootUser ? "ROOT" : user.roleCode)}
                            size="small"
                            color={isRootUser ? "error" : "primary"}
                            variant="outlined"
                            sx={{ fontWeight: 700, fontSize: "0.75rem" }}
                          />
                        </TableCell>

                        {/* Position & Info */}
                        <TableCell>
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <WorkIcon sx={{ fontSize: "0.875rem", color: "text.secondary" }} />
                              <Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary" }}>
                                {user.position || "บุคลากร"}
                              </Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                              {user.phone && (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                  <PhoneIcon sx={{ fontSize: "0.75rem", color: "text.secondary" }} />
                                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                    {user.phone}
                                  </Typography>
                                </Box>
                              )}
                              {userAge !== null && (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                  <CalendarTodayIcon sx={{ fontSize: "0.75rem", color: "text.secondary" }} />
                                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                    อายุ {userAge} ปี
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        </TableCell>

                        {/* Status Toggle */}
                        <TableCell align="center">
                          <Chip
                            label={user.isActive ? "ใช้งาน" : "ระงับ"}
                            size="small"
                            color={user.isActive ? "success" : "default"}
                            icon={
                              user.isActive ? (
                                <CheckCircleIcon sx={{ fontSize: "1rem !important" }} />
                              ) : (
                                <CancelIcon sx={{ fontSize: "1rem !important" }} />
                              )
                            }
                            onClick={isRootUser ? undefined : () => handleToggleStatus(user)}
                            sx={{
                              fontWeight: 700,
                              fontSize: "0.75rem",
                              cursor: isRootUser ? "default" : "pointer",
                            }}
                          />
                        </TableCell>

                        {/* Actions */}
                        <TableCell align="right">
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5 }}>
                            <Tooltip title="ดูโปรไฟล์">
                              <IconButton
                                component={Link}
                                href={`/profile/${user.id}`}
                                size="small"
                                sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="แก้ไขข้อมูล">
                              <IconButton
                                size="small"
                                onClick={() => openEditUserModal(user)}
                                sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            {!isRootUser && (
                              <Tooltip title="ลบผู้ใช้">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteUser(user)}
                                  sx={{ color: "text.secondary", "&:hover": { color: "error.main" } }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </Box>
      )}

      {/* ================= TAB 1: ROLES & PERMISSIONS ================= */}
      {activeTab === 1 && (
        <Grid container spacing={2.5}>
          {roles.map((role) => (
            <Grid key={role.id} size={{ xs: 12, md: 6, lg: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  border: "1px solid",
                  borderColor: "divider",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1, mb: 1.5 }}>
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "text.primary" }}>
                          {role.title}
                        </Typography>
                        {role.isSystem && (
                          <Chip label="ระบบ" size="small" sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700 }} />
                        )}
                      </Box>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: "monospace" }}>
                        รหัส {role.code}
                      </Typography>
                    </Box>

                    <Chip
                      label={role.code}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 700, fontSize: "0.75rem" }}
                    />
                  </Box>

                  {role.description && (
                    <Typography variant="body2" sx={{ color: "text.secondary", mb: 2, fontSize: "0.8125rem" }}>
                      {role.description}
                    </Typography>
                  )}

                  <Box sx={{ pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "text.primary", display: "block", mb: 1 }}>
                      สิทธิ์การเข้าถึง ({role.permissions?.length || 0} รายการ)
                    </Typography>
                    <Box sx={{ maxHeight: 200, overflowY: "auto", display: "flex", flexDirection: "column", gap: 0.75 }}>
                      {ALL_PERMISSIONS.map((perm) => {
                        const hasAccess = role.code === "ROOT" || role.permissions?.includes(perm.key);
                        return (
                          <Box
                            key={perm.key}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              p: 1,
                              borderRadius: 1,
                              border: "1px solid",
                              borderColor: hasAccess ? "success.200" : "divider",
                              bgcolor: hasAccess ? "success.50" : "grey.50",
                            }}
                          >
                            <Typography
                              variant="caption"
                              noWrap
                              sx={{
                                fontWeight: hasAccess ? 700 : 400,
                                color: hasAccess ? "success.900" : "text.secondary",
                              }}
                            >
                              {perm.title}
                            </Typography>
                            {hasAccess ? (
                              <CheckCircleIcon sx={{ fontSize: "1rem", color: "success.main", flexShrink: 0 }} />
                            ) : (
                              <CancelIcon sx={{ fontSize: "1rem", color: "text.disabled", flexShrink: 0 }} />
                            )}
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                </Box>

                <Box
                  sx={{
                    pt: 2,
                    mt: 2,
                    borderTop: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: 1,
                  }}
                >
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon fontSize="small" />}
                    onClick={() => openEditRoleModal(role)}
                    sx={{ fontWeight: 700 }}
                  >
                    แก้ไขสิทธิ์
                  </Button>

                  {!role.isSystem && role.code !== "ROOT" && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteRole(role)}
                      sx={{ border: "1px solid", borderColor: "error.200" }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* ================= MODAL: CREATE / EDIT USER ================= */}
      <Dialog
        open={showUserModal}
        onClose={() => setShowUserModal(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { sx: { borderRadius: 2 } } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            {userModalMode === "create" ? "เพิ่มผู้ใช้งานใหม่" : "แก้ไขข้อมูลผู้ใช้งาน"}
          </Typography>
          <IconButton size="small" onClick={() => setShowUserModal(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleUserFormSubmit}>
          <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "center", pb: 1 }}>
              <ImageUpload
                value={userFormData.avatarUrl}
                onChange={(url) => setUserFormData((prev) => ({ ...prev, avatarUrl: url || "" }))}
              />
            </Box>

            <TextField
              label="ชื่อ นามสกุล"
              required
              fullWidth
              size="small"
              placeholder="เช่น สมชาย ใจดี"
              value={userFormData.name}
              onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
            />

            <TextField
              label="อีเมลสำหรับเข้าสู่ระบบ"
              type="email"
              required
              fullWidth
              size="small"
              disabled={userModalMode === "edit"}
              placeholder="user@techniccom.ac.th"
              value={userFormData.email}
              onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
            />

            <TextField
              label={userModalMode === "create" ? "รหัสผ่าน" : "รหัสผ่านใหม่ (เว้นว่างไว้ถ้าไม่ต้องการเปลี่ยน)"}
              type="password"
              required={userModalMode === "create"}
              fullWidth
              size="small"
              placeholder="••••••••"
              value={userFormData.password}
              onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="role-select-label">ยศหรือสิทธิ์การใช้งาน</InputLabel>
                  <Select
                    labelId="role-select-label"
                    label="ยศหรือสิทธิ์การใช้งาน"
                    value={userFormData.roleCode}
                    onChange={(e) => setUserFormData({ ...userFormData, roleCode: e.target.value })}
                  >
                    {roles.map((r) => (
                      <MenuItem key={r.id} value={r.code}>
                        {r.title} ({r.code})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="ตำแหน่งงาน"
                  fullWidth
                  size="small"
                  placeholder="เช่น ครูผู้เชี่ยวชาญ"
                  value={userFormData.position}
                  onChange={(e) => setUserFormData({ ...userFormData, position: e.target.value })}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="เบอร์โทรศัพท์"
                  type="tel"
                  fullWidth
                  size="small"
                  placeholder="0812345678"
                  value={userFormData.phone}
                  onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="วันเกิด"
                  type="date"
                  fullWidth
                  size="small"
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={userFormData.birthDate}
                  onChange={(e) => setUserFormData({ ...userFormData, birthDate: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setShowUserModal(false)} color="inherit">
              ยกเลิก
            </Button>
            <Button type="submit" variant="contained" disabled={userFormSubmitting}>
              {userFormSubmitting ? "กำลังบันทึก..." : "บันทึกผู้ใช้"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ================= MODAL: CREATE / EDIT ROLE ================= */}
      <Dialog
        open={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        fullWidth
        maxWidth="md"
        slotProps={{ paper: { sx: { borderRadius: 2 } } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            {roleModalMode === "create" ? "สร้างยศหรือสิทธิ์ใหม่" : "แก้ไขยศและสิทธิ์"}
          </Typography>
          <IconButton size="small" onClick={() => setShowRoleModal(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleRoleFormSubmit}>
          <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="ชื่อยศ"
                  required
                  fullWidth
                  size="small"
                  placeholder="เช่น อาจารย์ผู้ประเมิน"
                  value={roleFormData.title}
                  onChange={(e) => setRoleFormData({ ...roleFormData, title: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="รหัสยศ"
                  required
                  fullWidth
                  size="small"
                  disabled={roleModalMode === "edit"}
                  placeholder="เช่น EVALUATOR"
                  value={roleFormData.code}
                  onChange={(e) =>
                    setRoleFormData({
                      ...roleFormData,
                      code: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_"),
                    })
                  }
                />
              </Grid>
            </Grid>

            <TextField
              label="คำอธิบายหน้าที่และความรับผิดชอบ"
              fullWidth
              size="small"
              placeholder="คำอธิบายหน้าที่ของยศนี้"
              value={roleFormData.description}
              onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
            />

            <FormControl fullWidth size="small">
              <InputLabel id="role-color-label">โทนสีแสดงผล</InputLabel>
              <Select
                labelId="role-color-label"
                label="โทนสีแสดงผล"
                value={roleFormData.color}
                onChange={(e) => setRoleFormData({ ...roleFormData, color: e.target.value })}
              >
                {COLOR_OPTIONS.map((c) => (
                  <MenuItem key={c.value} value={c.value}>
                    {c.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Permissions Checklist */}
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                กำหนดสิทธิ์การเข้าถึง
              </Typography>
              {AVAILABLE_PERMISSION_GROUPS.map((group) => (
                <Box key={group.category} sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block", mb: 0.5 }}>
                    {group.category}
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {group.items.map((item) => {
                      const checked = roleFormData.permissions.includes(item.key);
                      return (
                        <Paper
                          key={item.key}
                          variant="outlined"
                          onClick={() => togglePermission(item.key)}
                          sx={{
                            p: 1.25,
                            cursor: "pointer",
                            borderColor: checked ? "primary.main" : "divider",
                            bgcolor: checked ? "primary.50" : "background.paper",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 1.5,
                          }}
                        >
                          <Checkbox checked={checked} size="small" sx={{ p: 0, mt: 0.25 }} />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: checked ? 700 : 500 }}>
                              {item.title}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                              {item.description}
                            </Typography>
                          </Box>
                        </Paper>
                      );
                    })}
                  </Box>
                </Box>
              ))}
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setShowRoleModal(false)} color="inherit">
              ยกเลิก
            </Button>
            <Button type="submit" variant="contained" disabled={roleFormSubmitting}>
              {roleFormSubmitting ? "กำลังบันทึก..." : "บันทึกยศ"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800 }}>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2">{confirmDialog.content}</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmDialog((prev) => ({ ...prev, open: false }))} color="inherit">
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={async () => {
              setConfirmDialog((prev) => ({ ...prev, open: false }));
              await confirmDialog.onConfirm();
            }}
          >
            ยืนยัน
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", boxShadow: 3 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
