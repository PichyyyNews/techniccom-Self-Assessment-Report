"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Shield,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Loader2,
  ArrowLeft,
  X,
  Phone,
  Calendar,
  Briefcase,
  ShieldCheck,
  Plus,
  LayoutDashboard,
  Eye,
  Edit3,
  FileBadge,
  Check,
} from "lucide-react";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { clsx } from "clsx";

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
    icon: any;
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
        icon: LayoutDashboard,
      },
      {
        key: "/admin/users",
        title: "จัดการผู้ใช้และสิทธิ์ (User & Role Management)",
        description: "จัดการบัญชีบุคลากร กำหนดยศ และสิทธิ์การเข้าถึง",
        icon: Users,
      },
      {
        key: "/admin/licenses",
        title: "จัดการประเภทใบอนุญาต (License Types & Standards)",
        description: "จัดการประเภทใบอนุญาต คุรุสภา TPQI DSD กว. และตัวเลือกแนะนำ",
        icon: FileBadge,
      },
    ],
  },
  {
    category: "2. สิทธิ์โปรไฟล์บุคลากร (Staff Profile Permissions)",
    items: [
      {
        key: "profile.view_all",
        title: "ดูโปรไฟล์ของบุคลากรทุกคนได้ (Read-Only Social View)",
        description: "สามารถเปิดดูโปรไฟล์ วุฒิ ประวัติ ทักษะ และกิจกรรมของบุคลากรท่านอื่นได้",
        icon: Eye,
      },
      {
        key: "profile.edit_all",
        title: "แก้ไขโปรไฟล์ของบุคลากรท่านอื่นได้ (Edit Others' Profile)",
        description: "สามารถแก้ไขข้อมูลส่วนตัว วุฒิ ประวัติ ทักษะ และรูปของบุคลากรท่านอื่นได้",
        icon: Edit3,
      },
    ],
  },
];

const ALL_PERMISSIONS = AVAILABLE_PERMISSION_GROUPS.flatMap((g) => g.items);

const COLOR_OPTIONS = [
  { value: "teal", label: "สีเขียวหัวเป็ด (Teal)", badge: "bg-teal-50 text-teal-700 border-teal-200" },
  { value: "blue", label: "สีน้ำเงิน (Blue)", badge: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "purple", label: "สีม่วง (Purple)", badge: "bg-purple-50 text-purple-700 border-purple-200" },
  { value: "emerald", label: "สีเขียว (Emerald)", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "amber", label: "สีส้ม/ทอง (Amber)", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "indigo", label: "สีคราม (Indigo)", badge: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { value: "rose", label: "สีแดง (Rose)", badge: "bg-rose-50 text-rose-700 border-rose-200" },
  { value: "slate", label: "สีเทา (Slate)", badge: "bg-slate-50 text-slate-700 border-slate-200" },
];

export default function AdminUsersPage() {
  const { data: session } = useSession();

  // Active Tab: Users or Roles
  const [activeTab, setActiveTab] = useState<"users" | "roles">("users");

  // Users State
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // Roles State
  const [roles, setRoles] = useState<RoleDef[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

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

  // Badge Color Helper
  const getBadgeStyle = (color?: string | null) => {
    if (color === "rose") return "bg-rose-50 text-rose-700 border-rose-200";
    if (color === "purple") return "bg-purple-50 text-purple-700 border-purple-200";
    if (color === "emerald") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (color === "amber") return "bg-amber-50 text-amber-700 border-amber-200";
    if (color === "teal") return "bg-teal-50 text-teal-700 border-teal-200";
    return "bg-blue-50 text-blue-700 border-blue-200";
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
        alert(data.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        return;
      }

      setShowUserModal(false);
      fetchUsers();
      fetchRoles();
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
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
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || "ไม่สามารถเปลี่ยนสถานะผู้ใช้ได้");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (user: UserData) => {
    if (!confirm(`คุณต้องการลบผู้ใช้ "${user.name}" (${user.email}) ใช่หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || "ไม่สามารถลบผู้ใช้ได้");
      }
    } catch (err) {
      console.error(err);
    }
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
        alert(data.error || "เกิดข้อผิดพลาดในการบันทึกยศ/สิทธิ์");
        return;
      }

      setShowRoleModal(false);
      fetchRoles();
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setRoleFormSubmitting(false);
    }
  };

  const handleDeleteRole = async (role: RoleDef) => {
    if (!confirm(`คุณต้องการลบยศ "${role.title}" ใช่หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/admin/roles/${role.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchRoles();
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || "ไม่สามารถลบยศนี้ได้");
      }
    } catch (err) {
      console.error(err);
    }
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
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      {/* 1. Header with Breadcrumb & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div>
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/90 bg-white text-xs font-bold text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 shadow-2xs transition active:scale-95 select-none"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 group-hover:-translate-x-0.5 transition-transform" />
              <span>กลับหน้าหลัก (Dashboard)</span>
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-900 leading-tight">
            จัดการบัญชีผู้ใช้และสิทธิ์การใช้งาน
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            กำหนดข้อมูลบุคลากร รูปประจำตัว ควบคุมยศ และสิทธิ์การเข้าถึงแต่ละหน้าเว็บ
          </p>
        </div>

        {/* Dynamic Create Button */}
        <div>
          {activeTab === "users" && (
            <button
              onClick={openCreateUserModal}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700 active:scale-95 flex-shrink-0"
            >
              <UserPlus className="h-4 w-4" />
              เพิ่มผู้ใช้งานใหม่
            </button>
          )}

          {activeTab === "roles" && (
            <button
              onClick={openCreateRoleModal}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700 active:scale-95 flex-shrink-0"
            >
              <Plus className="h-4 w-4" />
              สร้างยศ/สิทธิ์ใหม่
            </button>
          )}
        </div>
      </div>

      {/* 2. Segmented Pill Tabs (2 Tabs: Users & Roles) */}
      <div className="flex p-1.5 bg-slate-200/60 rounded-2xl border border-slate-200/80 shadow-2xs overflow-x-auto gap-1.5 max-w-md">
        <button
          onClick={() => setActiveTab("users")}
          className={clsx(
            "flex-1 min-w-fit flex items-center justify-center gap-2 py-2.5 px-3.5 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 select-none whitespace-nowrap",
            activeTab === "users"
              ? "bg-white text-blue-600 shadow-sm shadow-slate-300/60"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
          )}
        >
          <Users className="h-4 w-4 flex-shrink-0" />
          <span>รายชื่อผู้ใช้งาน</span>
          <span
            className={clsx(
              "px-2 py-0.5 text-xs font-black rounded-md",
              activeTab === "users" ? "bg-blue-50 text-blue-700" : "bg-slate-300/70 text-slate-700"
            )}
          >
            {users.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("roles")}
          className={clsx(
            "flex-1 min-w-fit flex items-center justify-center gap-2 py-2.5 px-3.5 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 select-none whitespace-nowrap",
            activeTab === "roles"
              ? "bg-white text-blue-600 shadow-sm shadow-slate-300/60"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
          )}
        >
          <Shield className="h-4 w-4 flex-shrink-0" />
          <span>ยศและสิทธิ์การใช้งาน</span>
          <span
            className={clsx(
              "px-2 py-0.5 text-xs font-black rounded-md",
              activeTab === "roles" ? "bg-blue-50 text-blue-700" : "bg-slate-300/70 text-slate-700"
            )}
          >
            {roles.length}
          </span>
        </button>
      </div>

      {/* ================= TAB 1: USERS LIST ================= */}
      {activeTab === "users" && (
        <div className="space-y-6">
          {/* Filter and Search Bar */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              {/* Search */}
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ค้นหาชื่อ, อีเมล, เบอร์โทร..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>

              {/* Role Filter */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-xs font-bold text-slate-400 whitespace-nowrap">ยศ:</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full sm:w-auto px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm font-semibold text-slate-700 focus:bg-white focus:outline-none"
                >
                  <option value="ALL">ทุกลำดับยศ (ทั้งหมด)</option>
                  <option value="ROOT">ROOT (Super Admin)</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.code}>
                      {r.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-16 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
                <span className="text-sm font-medium">กำลังโหลดข้อมูลผู้ใช้งาน...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-16 flex flex-col items-center justify-center text-slate-400 text-center">
                <Users className="h-10 w-10 text-slate-300 mb-2" />
                <p className="font-bold text-slate-700">ไม่พบผู้ใช้งาน</p>
                <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรองยศ</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-4 sm:p-5">ผู้ใช้งาน</th>
                      <th className="p-4 sm:p-5">ยศ / สิทธิ์</th>
                      <th className="p-4 sm:p-5">ตำแหน่ง / ข้อมูล</th>
                      <th className="p-4 sm:p-5 text-center">สถานะ</th>
                      <th className="p-4 sm:p-5 text-right">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredUsers.map((user) => {
                      const userInitial = user.name ? user.name.charAt(0) : "U";
                      const isRootUser = user.roleCode === "ROOT";
                      const userAge = calculateAge(user.birthDate);

                      return (
                        <tr key={user.id} className="hover:bg-slate-50/70 transition">
                          {/* User Avatar & Name */}
                          <td className="p-4 sm:p-5">
                            <div className="flex items-center gap-3">
                              {user.avatarUrl ? (
                                <img
                                  src={user.avatarUrl}
                                  alt={user.name}
                                  onError={(e) => {
                                    const target = e.currentTarget;
                                    target.style.display = "none";
                                    if (target.nextElementSibling) {
                                      (target.nextElementSibling as HTMLElement).style.display = "flex";
                                    }
                                  }}
                                  className="h-10 w-10 rounded-2xl object-cover border border-slate-200 shadow-2xs flex-shrink-0"
                                />
                              ) : null}
                              <div
                                style={{ display: user.avatarUrl ? "none" : "flex" }}
                                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-sm shadow-2xs flex-shrink-0"
                              >
                                {userInitial}
                              </div>

                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 truncate">{user.name}</div>
                                <div className="text-xs text-slate-400 truncate">{user.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="p-4 sm:p-5">
                            <span
                              className={clsx(
                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border shadow-2xs",
                                getBadgeStyle(user.roleDefinition?.color || (isRootUser ? "rose" : "blue"))
                              )}
                            >
                              <ShieldCheck className="h-3.5 w-3.5" />
                              {user.roleDefinition?.title || (isRootUser ? "ROOT" : user.roleCode)}
                            </span>
                          </td>

                          {/* Position & Info */}
                          <td className="p-4 sm:p-5 text-slate-600 text-xs space-y-1">
                            <div className="font-bold text-slate-800 flex items-center gap-1">
                              <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                              {user.position || "บุคลากร"}
                            </div>
                            <div className="text-slate-400 flex items-center gap-2 text-[11px]">
                              {user.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" /> {user.phone}
                                </span>
                              )}
                              {userAge !== null && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" /> อายุ {userAge} ปี
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="p-4 sm:p-5 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(user)}
                              disabled={isRootUser}
                              className={clsx(
                                "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition",
                                user.isActive
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200",
                                isRootUser ? "cursor-default" : "hover:opacity-80 active:scale-95"
                              )}
                            >
                              {user.isActive ? (
                                <>
                                  <CheckCircle2 className="h-3.5 w-3.5" /> ใช้งาน
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3.5 w-3.5" /> ระงับ
                                </>
                              )}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="p-4 sm:p-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Social Profile View Link */}
                              <Link
                                href={`/profile/${user.id}`}
                                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition shadow-2xs"
                                title="ดูโปรไฟล์"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>

                              <button
                                type="button"
                                onClick={() => openEditUserModal(user)}
                                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                                title="แก้ไขผู้ใช้งาน"
                              >
                                <Edit2 className="h-4 w-4 text-blue-600" />
                              </button>

                              {!isRootUser && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(user)}
                                  className="p-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition shadow-2xs"
                                  title="ลบผู้ใช้งาน"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: ROLES & PERMISSIONS ================= */}
      {activeTab === "roles" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {roles.map((role) => (
              <div
                key={role.id}
                className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base">{role.title}</h3>
                        {role.isSystem && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-600 border border-slate-200">
                            ระบบ
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-xs text-slate-400 block mt-0.5">
                        Code: {role.code}
                      </span>
                    </div>

                    <span
                      className={clsx(
                        "px-2.5 py-1 rounded-xl text-xs font-bold border shadow-2xs",
                        getBadgeStyle(role.color)
                      )}
                    >
                      {role.code}
                    </span>
                  </div>

                  {role.description && (
                    <p className="text-xs text-slate-500 leading-relaxed">{role.description}</p>
                  )}

                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-700 block mb-2">
                      สิทธิ์การเข้าถึง ({role.permissions?.length || 0} รายการ):
                    </span>
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                      {ALL_PERMISSIONS.map((perm) => {
                        const hasAccess =
                          role.code === "ROOT" || role.permissions?.includes(perm.key);

                        return (
                          <div
                            key={perm.key}
                            className={clsx(
                              "flex items-center justify-between text-[11px] p-2 rounded-xl border",
                              hasAccess
                                ? "bg-emerald-50/60 text-emerald-900 border-emerald-200 font-bold"
                                : "bg-slate-50 text-slate-400 border-slate-200"
                            )}
                          >
                            <span className="truncate flex-1">{perm.title}</span>
                            {hasAccess ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Role Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEditRoleModal(role)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition active:scale-95 shadow-2xs"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-blue-600" />
                    แก้ไขสิทธิ์
                  </button>

                  {!role.isSystem && role.code !== "ROOT" && (
                    <button
                      type="button"
                      onClick={() => handleDeleteRole(role)}
                      className="p-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition active:scale-95 shadow-2xs"
                      title="ลบยศนี้"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE / EDIT USER ================= */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white p-5 sm:p-7 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                {userModalMode === "create" ? "เพิ่มผู้ใช้งานใหม่" : "แก้ไขข้อมูลผู้ใช้งาน"}
              </h3>
              <button
                type="button"
                onClick={() => setShowUserModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUserFormSubmit} className="space-y-3.5 text-xs">
              <div className="flex justify-center pb-2">
                <ImageUpload
                  value={userFormData.avatarUrl}
                  onChange={(url) => setUserFormData((prev) => ({ ...prev, avatarUrl: url || "" }))}
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">ชื่อ-นามสกุล *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น สมชาย ใจดี"
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">อีเมล (ใช้เข้าสู่ระบบ) *</label>
                <input
                  type="email"
                  required
                  disabled={userModalMode === "edit"}
                  placeholder="user@techniccom.ac.th"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none disabled:opacity-60"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">
                  {userModalMode === "create" ? "รหัสผ่าน *" : "รหัสผ่านใหม่ (เว้นว่างไว้ถ้าไม่เปลี่ยน)"}
                </label>
                <input
                  type="password"
                  required={userModalMode === "create"}
                  placeholder="••••••••"
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">ยศ / สิทธิ์การใช้งาน *</label>
                  <select
                    value={userFormData.roleCode}
                    onChange={(e) => setUserFormData({ ...userFormData, roleCode: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.code}>
                        {r.title} ({r.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">ตำแหน่งงาน</label>
                  <input
                    type="text"
                    placeholder="เช่น ครูผู้เชี่ยวชาญ"
                    value={userFormData.position}
                    onChange={(e) => setUserFormData({ ...userFormData, position: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">เบอร์โทรศัพท์</label>
                  <input
                    type="tel"
                    placeholder="081-234-5678"
                    value={userFormData.phone}
                    onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">วัน/เดือน/ปีเกิด</label>
                  <input
                    type="date"
                    value={userFormData.birthDate}
                    onChange={(e) => setUserFormData({ ...userFormData, birthDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={userFormSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {userFormSubmitting ? "กำลังบันทึก..." : "บันทึกผู้ใช้"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE / EDIT ROLE ================= */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-3xl bg-white p-5 sm:p-7 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                {roleModalMode === "create" ? "สร้างยศ/สิทธิ์ใหม่" : "แก้ไขยศและสิทธิ์"}
              </h3>
              <button
                type="button"
                onClick={() => setShowRoleModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRoleFormSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">ชื่อยศ (Title) *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น อาจารย์ผู้ประเมิน"
                    value={roleFormData.title}
                    onChange={(e) => setRoleFormData({ ...roleFormData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">รหัสยศ (Code) *</label>
                  <input
                    type="text"
                    required
                    disabled={roleModalMode === "edit"}
                    placeholder="เช่น EVALUATOR"
                    value={roleFormData.code}
                    onChange={(e) =>
                      setRoleFormData({
                        ...roleFormData,
                        code: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_"),
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs focus:bg-white focus:outline-none disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">คำอธิบาย</label>
                <input
                  type="text"
                  placeholder="คำอธิบายหน้าที่และความรับผิดชอบของยศนี้..."
                  value={roleFormData.description}
                  onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">โทนสี Badge</label>
                <select
                  value={roleFormData.color}
                  onChange={(e) => setRoleFormData({ ...roleFormData, color: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none"
                >
                  {COLOR_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Permissions Checklist */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="font-bold text-slate-900 block">กำหนดสิทธิ์การเข้าถึง (Permissions):</label>
                {AVAILABLE_PERMISSION_GROUPS.map((group) => (
                  <div key={group.category} className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-500">{group.category}</span>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const checked = roleFormData.permissions.includes(item.key);
                        return (
                          <label
                            key={item.key}
                            className={clsx(
                              "flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition",
                              checked
                                ? "bg-blue-50/60 border-blue-200 text-blue-950 font-bold"
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100/70"
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => togglePermission(item.key)}
                              className="h-4 w-4 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="min-w-0">
                              <div className="text-xs">{item.title}</div>
                              <div className="text-[11px] font-normal text-slate-400">{item.description}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={roleFormSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {roleFormSubmitting ? "กำลังบันทึก..." : "บันทึกยศ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
