"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Shield,
  Search,
  Filter,
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
  KeyRound,
  ShieldCheck,
  Plus,
  Lock,
  LayoutDashboard,
  Settings,
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

const AVAILABLE_PAGES = [
  {
    path: "/dashboard",
    title: "หน้าหลักบุคลากร (Dashboard)",
    description: "เข้าถึงภาพรวมระบบและข้อมูลส่วนตัว",
    icon: LayoutDashboard,
  },
  {
    path: "/admin/users",
    title: "จัดการผู้ใช้และสิทธิ์ (User & Role Management)",
    description: "จัดการบัญชีบุคลากร กำหนดยศ และสิทธิ์การเข้าถึง",
    icon: Users,
  },
];

const COLOR_OPTIONS = [
  { value: "blue", label: "สีน้ำเงิน", badge: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "rose", label: "สีแดง", badge: "bg-rose-50 text-rose-700 border-rose-200" },
  { value: "emerald", label: "สีเขียว", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "purple", label: "สีม่วง", badge: "bg-purple-50 text-purple-700 border-purple-200" },
  { value: "amber", label: "สีส้ม", badge: "bg-amber-50 text-amber-700 border-amber-200" },
];

export default function AdminUsersPage() {
  const { data: session } = useSession();

  // Active Tab
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
    if (!confirm(`คุณต้องการลบผู้ใช้งาน "${user.name}" ใช่หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchUsers();
        fetchRoles();
      } else {
        const data = await res.json();
        alert(data.error || "ไม่สามารถลบผู้ใช้งานได้");
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

  const togglePermission = (path: string) => {
    setRoleFormData((prev) => {
      const current = prev.permissions;
      if (current.includes(path)) {
        return { ...prev, permissions: current.filter((p) => p !== path) };
      } else {
        return { ...prev, permissions: [...current, path] };
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
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1.5">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            กลับหน้า Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20 flex-shrink-0">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-tight">
                จัดการผู้ใช้และสิทธิ์การใช้งาน
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                กำหนดข้อมูลบุคลากร รูปประจำตัว และกำหนดสิทธิ์การเข้าถึงระบบ
              </p>
            </div>
          </div>
        </div>

        {/* Create Buttons */}
        <div className="flex items-center gap-2">
          {activeTab === "users" ? (
            <button
              onClick={openCreateUserModal}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 active:scale-95"
            >
              <UserPlus className="h-4 w-4" />
              เพิ่มผู้ใช้งานใหม่
            </button>
          ) : (
            <button
              onClick={openCreateRoleModal}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              สร้างยศ/สิทธิ์ใหม่
            </button>
          )}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab("users")}
          className={clsx(
            "flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition -mb-px",
            activeTab === "users"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          )}
        >
          <Users className="h-4 w-4" />
          รายชื่อผู้ใช้งาน
          <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700">
            {users.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("roles")}
          className={clsx(
            "flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition -mb-px",
            activeTab === "roles"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          )}
        >
          <Shield className="h-4 w-4" />
          ยศและสิทธิ์การเข้าถึง
          <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700">
            {roles.length}
          </span>
        </button>
      </div>

      {/* ================= TAB 1: USERS LIST ================= */}
      {activeTab === "users" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ค้นหาตามชื่อ, อีเมล, ตำแหน่ง, หรือเบอร์โทร..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition font-medium"
                >
                  <option value="ALL">ทุกสิทธิ์การใช้งาน (All Roles)</option>
                  {roles.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Users Content */}
          {loading ? (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-14 flex flex-col items-center justify-center text-slate-400 shadow-sm">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
              <span className="text-sm font-medium">กำลังโหลดข้อมูลผู้ใช้งานจาก PostgreSQL...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-14 flex flex-col items-center justify-center text-center text-slate-500 shadow-sm">
              <Users className="h-10 w-10 text-slate-300 mb-2" />
              <p className="font-bold text-slate-700">ไม่พบข้อมูลผู้ใช้งาน</p>
              <p className="text-xs text-slate-400 mt-1">คลิกปุ่ม "เพิ่มผู้ใช้งานใหม่" เพื่อสร้างผู้ใช้คนแรก</p>
            </div>
          ) : (
            <>
              {/* 1. Mobile Cards View */}
              <div className="block md:hidden space-y-3">
                {filteredUsers.map((user) => {
                  const age = calculateAge(user.birthDate);
                  const roleDef = user.roleDefinition;
                  const roleTitle = roleDef?.title || user.roleCode;
                  const roleColor = roleDef?.color || (user.roleCode === "ROOT" ? "rose" : "blue");

                  return (
                    <div
                      key={user.id}
                      className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:shadow-md space-y-3"
                    >
                      {/* Card Header: Avatar, Name, Email, Role */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.name}
                              className="h-12 w-12 rounded-2xl object-cover border border-slate-200 shadow-2xs flex-shrink-0 bg-white"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 font-bold text-base flex-shrink-0 border border-blue-200 shadow-2xs">
                              {user.name ? user.name.charAt(0) : "U"}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 text-sm leading-snug break-words">
                              {user.name}
                            </h3>
                            <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
                          </div>
                        </div>

                        <span
                          className={clsx(
                            "inline-flex items-center gap-1 px-2.5 py-1 text-xs font-black rounded-lg border flex-shrink-0",
                            getBadgeStyle(roleColor)
                          )}
                        >
                          {user.roleCode === "ROOT" && <Shield className="h-3 w-3" />}
                          {roleTitle}
                        </span>
                      </div>

                      {/* Card Details: Position, Phone, Birth Date & Age */}
                      <div className="grid grid-cols-2 gap-2 bg-slate-50/80 p-3 rounded-2xl border border-slate-100 text-xs">
                        <div>
                          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mb-0.5">
                            <Briefcase className="h-3 w-3 text-slate-400" />
                            ตำแหน่ง
                          </span>
                          <p className="font-bold text-slate-800 truncate">{user.position || "-"}</p>
                        </div>

                        <div>
                          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mb-0.5">
                            <Phone className="h-3 w-3 text-slate-400" />
                            เบอร์โทร
                          </span>
                          {user.phone ? (
                            <a href={`tel:${user.phone}`} className="font-bold text-blue-600 underline truncate block">
                              {user.phone}
                            </a>
                          ) : (
                            <p className="font-bold text-slate-800">-</p>
                          )}
                        </div>

                        <div className="col-span-2 pt-1.5 border-t border-slate-200/50 flex items-center justify-between text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            <span>
                              {user.birthDate
                                ? new Date(user.birthDate).toLocaleDateString("th-TH")
                                : "ไม่ระบุวันเกิด"}
                            </span>
                          </div>
                          {age !== null && (
                            <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
                              อายุ {age} ปี
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Actions Footer */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(user)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${
                            user.isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-500 border border-slate-200"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              user.isActive ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                          {user.isActive ? "ใช้งานปกติ" : "ระงับการใช้"}
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditUserModal(user)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition active:scale-95 shadow-2xs"
                          >
                            <Edit2 className="h-3.5 w-3.5 text-blue-600" />
                            แก้ไข
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user)}
                            className="p-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition active:scale-95 shadow-2xs"
                            title="ลบผู้ใช้งาน"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 2. Desktop Table View */}
              <div className="hidden md:block rounded-3xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="border-b border-slate-100 bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-6 py-4">รูปประจำตัว / ชื่อ - สกุล</th>
                        <th className="px-6 py-4">ยศ / สิทธิ์การใช้งาน</th>
                        <th className="px-6 py-4">ตำแหน่ง / เบอร์โทร</th>
                        <th className="px-6 py-4">วดป. เกิด / อายุ</th>
                        <th className="px-6 py-4 text-center">สถานะ</th>
                        <th className="px-6 py-4 text-right">การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.map((user) => {
                        const age = calculateAge(user.birthDate);
                        const roleDef = user.roleDefinition;
                        const roleTitle = roleDef?.title || user.roleCode;
                        const roleColor = roleDef?.color || (user.roleCode === "ROOT" ? "rose" : "blue");

                        return (
                          <tr key={user.id} className="hover:bg-slate-50/60 transition">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {user.avatarUrl ? (
                                  <img
                                    src={user.avatarUrl}
                                    alt={user.name}
                                    className="h-11 w-11 rounded-2xl object-cover border border-slate-200 shadow-2xs flex-shrink-0 bg-white"
                                  />
                                ) : (
                                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 font-bold text-sm flex-shrink-0 border border-blue-200 shadow-2xs">
                                    {user.name ? user.name.charAt(0) : "U"}
                                  </div>
                                )}
                                <div>
                                  <div className="font-bold text-slate-900">{user.name}</div>
                                  <div className="text-xs text-slate-400">{user.email}</div>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <span
                                className={clsx(
                                  "inline-flex items-center gap-1 px-2.5 py-1 text-xs font-black rounded-lg border",
                                  getBadgeStyle(roleColor)
                                )}
                              >
                                {user.roleCode === "ROOT" && <Shield className="h-3.5 w-3.5" />}
                                {roleTitle}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              <div className="space-y-0.5">
                                <div className="text-slate-800 font-semibold text-xs flex items-center gap-1">
                                  <Briefcase className="h-3 w-3 text-slate-400" />
                                  {user.position || "-"}
                                </div>
                                <div className="text-slate-400 text-xs flex items-center gap-1">
                                  <Phone className="h-3 w-3 text-slate-400" />
                                  {user.phone || "-"}
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <div className="space-y-0.5">
                                <div className="text-slate-700 text-xs flex items-center gap-1">
                                  <Calendar className="h-3 w-3 text-slate-400" />
                                  {user.birthDate
                                    ? new Date(user.birthDate).toLocaleDateString("th-TH")
                                    : "-"}
                                </div>
                                <div className="text-slate-500 text-xs font-medium">
                                  {age !== null ? `อายุ ${age} ปี` : "-"}
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(user)}
                                title="คลิกเพื่อสลับสถานะ"
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition ${
                                  user.isActive
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                    : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                                }`}
                              >
                                {user.isActive ? (
                                  <>
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    ปกติ
                                  </>
                                ) : (
                                  <>
                                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                    ระงับ
                                  </>
                                )}
                              </button>
                            </td>

                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => openEditUserModal(user)}
                                  className="p-2 rounded-xl text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition"
                                  title="แก้ไขข้อมูล / เปลี่ยนรหัสผ่าน"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(user)}
                                  className="p-2 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                                  title="ลบผู้ใช้งาน"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ================= TAB 2: ROLES & PERMISSIONS ================= */}
      {activeTab === "roles" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <div
                key={role.id}
                className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div>
                  {/* Role Top Info */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span
                        className={clsx(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black border",
                          getBadgeStyle(role.color)
                        )}
                      >
                        {role.code === "ROOT" && <Shield className="h-3.5 w-3.5" />}
                        {role.title}
                      </span>
                      <div className="text-[11px] font-mono text-slate-400 mt-1">
                        รหัสยศ: {role.code}
                      </div>
                    </div>

                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {role._count?.users || 0} ผู้ใช้
                    </span>
                  </div>

                  {/* Role Description */}
                  <p className="text-xs text-slate-500 mt-3">
                    {role.description || "ไม่มีคำอธิบายเพิ่มเติม"}
                  </p>

                  {/* Allowed Pages Permissions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      สิทธิ์การเข้าถึงหน้าเว็บ (Allowed Pages):
                    </span>
                    <div className="space-y-1.5">
                      {AVAILABLE_PAGES.map((page) => {
                        const hasAccess = role.permissions?.includes(page.path);
                        const Icon = page.icon;
                        return (
                          <div
                            key={page.path}
                            className={clsx(
                              "flex items-center gap-2 p-2 rounded-xl text-xs font-medium border",
                              hasAccess
                                ? "bg-emerald-50/60 border-emerald-200 text-emerald-800"
                                : "bg-slate-50 border-slate-200/70 text-slate-400 opacity-60"
                            )}
                          >
                            <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate flex-1">{page.title}</span>
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

      {/* ================= MODAL: USER CREATE / EDIT ================= */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 p-0 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-t-3xl sm:rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-300 ease-out max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
            {/* Sticky Header */}
            <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-slate-100 flex-shrink-0 bg-white">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                {userModalMode === "create" ? (
                  <>
                    <UserPlus className="h-5 w-5 text-blue-600" />
                    เพิ่มผู้ใช้งานใหม่
                  </>
                ) : (
                  <>
                    <Edit2 className="h-5 w-5 text-blue-600" />
                    แก้ไขข้อมูลผู้ใช้
                  </>
                )}
              </h3>
              <button
                type="button"
                onClick={() => setShowUserModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-50 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleUserFormSubmit} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 space-y-4">
                {/* Image Upload Component for รูปประจำตัว */}
                <ImageUpload
                  value={userFormData.avatarUrl}
                  onChange={(url) => setUserFormData({ ...userFormData, avatarUrl: url || "" })}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ชื่อ - นามสกุล <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={userFormData.name}
                      onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                      placeholder="เช่น นายรักเรียน เพียรศึกษา"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      อีเมล (Email) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      disabled={userModalMode === "edit"}
                      value={userFormData.email}
                      onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                      placeholder="name@technic.ac.th"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 disabled:opacity-60 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {userModalMode === "create" ? (
                        <>รหัสผ่าน <span className="text-rose-500">*</span></>
                      ) : (
                        <>เปลี่ยนรหัสผ่าน (เว้นว่างไว้หากไม่เปลี่ยน)</>
                      )}
                    </label>
                    <input
                      type="password"
                      required={userModalMode === "create"}
                      value={userFormData.password}
                      onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                      placeholder={userModalMode === "create" ? "กำหนดรหัสผ่าน" : "••••••••"}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ยศ / สิทธิ์การใช้งาน <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={userFormData.roleCode}
                      onChange={(e) => setUserFormData({ ...userFormData, roleCode: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition font-medium"
                    >
                      {roles.map((r) => (
                        <option key={r.code} value={r.code}>
                          {r.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ตำแหน่งงาน
                    </label>
                    <input
                      type="text"
                      value={userFormData.position}
                      onChange={(e) => setUserFormData({ ...userFormData, position: e.target.value })}
                      placeholder="เช่น ครู คศ.2, ครูผู้ช่วย, ธุรการ"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      เบอร์โทรศัพท์
                    </label>
                    <input
                      type="tel"
                      value={userFormData.phone}
                      onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                      placeholder="081-234-5678"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      วันเดือนปีเกิด (วดป. เกิด)
                    </label>
                    <input
                      type="date"
                      value={userFormData.birthDate}
                      onChange={(e) => setUserFormData({ ...userFormData, birthDate: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      อายุ (คำนวณอัตโนมัติ)
                    </label>
                    <div className="rounded-xl border border-slate-200 bg-slate-100/70 p-2.5 text-sm text-slate-700 font-bold">
                      {calculateAge(userFormData.birthDate) !== null
                        ? `${calculateAge(userFormData.birthDate)} ปี`
                        : "-"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky Bottom Actions */}
              <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur px-5 sm:px-7 py-3.5 sm:py-4 border-t border-slate-100 flex items-center justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="flex-1 sm:flex-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 active:scale-95"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={userFormSubmitting}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 active:scale-95 disabled:opacity-70"
                >
                  {userFormSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {userModalMode === "create" ? "สร้างผู้ใช้งาน" : "บันทึกการเปลี่ยนแปลง"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ROLE CREATE / EDIT ================= */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 p-0 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-300 ease-out max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
            {/* Sticky Header */}
            <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-slate-100 flex-shrink-0 bg-white">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                {roleModalMode === "create" ? "สร้างยศ/สิทธิ์ใหม่" : "แก้ไขยศและสิทธิ์การเข้าถึง"}
              </h3>
              <button
                type="button"
                onClick={() => setShowRoleModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-50 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleRoleFormSubmit} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ชื่อยศ / สิทธิ์ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={roleFormData.title}
                    onChange={(e) => setRoleFormData({ ...roleFormData, title: e.target.value })}
                    placeholder="เช่น หัวหน้างานประกันคุณภาพ, ครูผู้สอน"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      รหัสยศ (Key Code)
                    </label>
                    <input
                      type="text"
                      disabled={roleModalMode === "edit"}
                      value={roleFormData.code}
                      onChange={(e) => setRoleFormData({ ...roleFormData, code: e.target.value })}
                      placeholder="เช่น QA_HEAD, TEACHER"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 uppercase font-mono disabled:opacity-60 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      โทนสี Badge
                    </label>
                    <select
                      value={roleFormData.color}
                      onChange={(e) => setRoleFormData({ ...roleFormData, color: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition font-medium"
                    >
                      {COLOR_OPTIONS.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    คำอธิบายหน้าที่
                  </label>
                  <textarea
                    rows={2}
                    value={roleFormData.description}
                    onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                    placeholder="ระบุหน้าที่ความรับผิดชอบของยศนี้..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition"
                  />
                </div>

                {/* Page Access Checkboxes */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-900 mb-2">
                    กำหนดสิทธิ์การเข้าถึงหน้าเว็บ (Allowed Pages) <span className="text-rose-500">*</span>
                  </label>

                  <div className="space-y-2">
                    {AVAILABLE_PAGES.map((page) => {
                      const isChecked = roleFormData.permissions.includes(page.path);
                      const Icon = page.icon;

                      return (
                        <label
                          key={page.path}
                          className={clsx(
                            "flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition select-none",
                            isChecked
                              ? "border-blue-500 bg-blue-50/40"
                              : "border-slate-200 hover:bg-slate-50"
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePermission(page.path)}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                              <Icon className="h-3.5 w-3.5 text-blue-600" />
                              {page.title}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {page.description}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Sticky Bottom Actions */}
              <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur px-5 sm:px-7 py-3.5 sm:py-4 border-t border-slate-100 flex items-center justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="flex-1 sm:flex-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 active:scale-95"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={roleFormSubmitting}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 active:scale-95 disabled:opacity-70"
                >
                  {roleFormSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {roleModalMode === "create" ? "สร้างยศใหม่" : "บันทึกการเปลี่ยนแปลง"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
