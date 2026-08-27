"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Shield,
  Loader2,
  X,
  Phone,
  Calendar,
  Briefcase,
  User as UserIcon,
  ArrowLeft,
  KeyRound,
} from "lucide-react";
import Link from "next/link";

interface UserItem {
  id: string;
  email: string;
  name: string;
  role: "ROOT" | "STAFF";
  position: string | null;
  phone: string | null;
  birthDate: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

function calculateAge(birthDateString?: string | null) {
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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "STAFF" as "ROOT" | "STAFF",
    position: "",
    phone: "",
    birthDate: "",
    avatarUrl: "",
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      } else {
        setAlert({ type: "error", msg: data.error || "ดึงข้อมูลไม่สำเร็จ" });
      }
    } catch (err: any) {
      setAlert({ type: "error", msg: err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "STAFF",
      position: "",
      phone: "",
      birthDate: "",
      avatarUrl: "",
    });
    setShowModal(true);
  };

  const openEditModal = (user: UserItem) => {
    setModalMode("edit");
    setSelectedUser(user);
    const dateFormatted = user.birthDate ? user.birthDate.split("T")[0] : "";
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      position: user.position || "",
      phone: user.phone || "",
      birthDate: dateFormatted,
      avatarUrl: user.avatarUrl || "",
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setAlert(null);

    try {
      if (modalMode === "create") {
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (res.ok) {
          setAlert({ type: "success", msg: "เพิ่มผู้ใช้งานใหม่เรียบร้อยแล้ว" });
          setShowModal(false);
          fetchUsers();
        } else {
          setAlert({ type: "error", msg: data.error || "ไม่สามารถเพิ่มผู้ใช้งานได้" });
        }
      } else {
        if (!selectedUser) return;
        const payload: any = {
          name: formData.name,
          role: formData.role,
          position: formData.position,
          phone: formData.phone,
          birthDate: formData.birthDate || null,
          avatarUrl: formData.avatarUrl,
        };
        if (formData.password.trim().length > 0) {
          payload.password = formData.password.trim();
        }

        const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok) {
          setAlert({ type: "success", msg: "อัปเดตข้อมูลผู้ใช้เรียบร้อยแล้ว" });
          setShowModal(false);
          fetchUsers();
        } else {
          setAlert({ type: "error", msg: data.error || "ไม่สามารถแก้ไขข้อมูลได้" });
        }
      }
    } catch (err: any) {
      setAlert({ type: "error", msg: err.message || "เกิดข้อผิดพลาดในการบันทึก" });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: UserItem) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      const data = await res.json();
      if (res.ok) {
        setAlert({
          type: "success",
          msg: user.isActive ? "ระงับการใช้งานบัญชีแล้ว" : "เปิดใช้งานบัญชีเรียบร้อยแล้ว",
        });
        fetchUsers();
      } else {
        setAlert({ type: "error", msg: data.error || "เปลี่ยนสถานะไม่สำเร็จ" });
      }
    } catch (err: any) {
      setAlert({ type: "error", msg: err.message });
    }
  };

  const handleDeleteUser = async (user: UserItem) => {
    if (!confirm(`คุณต้องการลบผู้ใช้ "${user.name}" (${user.email}) หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setAlert({ type: "success", msg: "ลบผู้ใช้เรียบร้อยแล้ว" });
        fetchUsers();
      } else {
        setAlert({ type: "error", msg: data.error || "ไม่สามารถลบได้" });
      }
    } catch (err: any) {
      setAlert({ type: "error", msg: err.message });
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.position || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.phone || "").toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb / Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 mb-2 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            กลับหน้า Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
            <Users className="h-8 w-8 text-blue-600" />
            จัดการผู้ใช้งานในระบบ (User Management)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            สร้างบัญชี กำหนดตำแหน่ง เบอร์โทร วันเกิด (คำนวณอายุอัตโนมัติ) และกำหนดสิทธิ์ (ROOT / บุคลากร)
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700 active:scale-95"
        >
          <UserPlus className="h-4 w-4" />
          เพิ่มผู้ใช้งานใหม่
        </button>
      </div>

      {/* Alert Banner */}
      {alert && (
        <div
          className={`flex items-center justify-between rounded-2xl p-4 text-xs sm:text-sm font-medium animate-in fade-in duration-150 ${
            alert.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border border-rose-200 bg-rose-50 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {alert.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
            )}
            <span>{alert.msg}</span>
          </div>
          <button onClick={() => setAlert(null)} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาตามชื่อ, อีเมล, ตำแหน่ง, หรือเบอร์โทร..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 hidden sm:block" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white py-3 px-4 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition shadow-xs font-medium"
          >
            <option value="ALL">ทุกสิทธิ์การใช้งาน (All Roles)</option>
            <option value="ROOT">ผู้ดูแลระบบสูงสุด (ROOT)</option>
            <option value="STAFF">บุคลากร (STAFF)</option>
          </select>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-14 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
            <span className="text-sm font-medium">กำลังโหลดข้อมูลผู้ใช้งานจาก PostgreSQL...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-14 text-center text-slate-500">
            <Users className="h-10 w-10 text-slate-300 mb-2" />
            <p className="font-bold text-slate-700">ไม่พบข้อมูลผู้ใช้งาน</p>
            <p className="text-xs text-slate-400 mt-1">คลิกปุ่ม "เพิ่มผู้ใช้งานใหม่" เพื่อสร้างผู้ใช้คนแรก</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-100 bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">ชื่อ - นามสกุล / อีเมล</th>
                  <th className="px-6 py-4">ยศ / สิทธิ์</th>
                  <th className="px-6 py-4">ตำแหน่ง / เบอร์โทร</th>
                  <th className="px-6 py-4">วดป. เกิด / อายุ</th>
                  <th className="px-6 py-4 text-center">สถานะ</th>
                  <th className="px-6 py-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => {
                  const age = calculateAge(user.birthDate);
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 font-bold text-sm flex-shrink-0 border border-blue-200">
                            {user.name ? user.name.charAt(0) : "U"}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{user.name}</div>
                            <div className="text-xs text-slate-400">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {user.role === "ROOT" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-black rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                            <Shield className="h-3.5 w-3.5" />
                            ROOT
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                            บุคลากร
                          </span>
                        )}
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
                            onClick={() => openEditModal(user)}
                            className="p-2 rounded-xl text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition"
                            title="แก้ไขข้อมูล / เปลี่ยนรหัสผ่าน"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
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
        )}
      </div>

      {/* Modal: Create or Edit User */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                {modalMode === "create" ? (
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
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ชื่อ - นามสกุล <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    disabled={modalMode === "edit"}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@technic.ac.th"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 disabled:opacity-60 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {modalMode === "create" ? (
                      <>รหัสผ่าน <span className="text-rose-500">*</span></>
                    ) : (
                      <>เปลี่ยนรหัสผ่าน (เว้นว่างไว้หากไม่เปลี่ยน)</>
                    )}
                  </label>
                  <input
                    type="password"
                    required={modalMode === "create"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={modalMode === "create" ? "กำหนดรหัสผ่าน" : "••••••••"}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ยศ / สิทธิ์การใช้งาน <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as "ROOT" | "STAFF" })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition font-medium"
                  >
                    <option value="STAFF">บุคลากร (STAFF)</option>
                    <option value="ROOT">ผู้ดูแลระบบสูงสุด (ROOT)</option>
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
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
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
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    อายุ (คำนวณอัตโนมัติ)
                  </label>
                  <div className="rounded-xl border border-slate-200 bg-slate-100/70 p-2.5 text-sm text-slate-700 font-bold">
                    {calculateAge(formData.birthDate) !== null
                      ? `${calculateAge(formData.birthDate)} ปี`
                      : "-"}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  URL รูปโปรไฟล์ (Avatar URL)
                </label>
                <input
                  type="url"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 active:scale-[0.99] disabled:opacity-70"
                >
                  {formSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {modalMode === "create" ? "สร้างผู้ใช้งาน" : "บันทึกการเปลี่ยนแปลง"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
