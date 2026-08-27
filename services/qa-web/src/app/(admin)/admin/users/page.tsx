"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit2,
  Trash2,
  KeyRound,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  Shield,
  Loader2,
  X,
} from "lucide-react";

interface Department {
  id: string;
  code: string;
  nameTh: string;
}

interface UserItem {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "QA_HEAD" | "DEPT_HEAD" | "TEACHER" | "AUDITOR";
  departmentId: string | null;
  department: Department | null;
  isActive: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
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
    role: "TEACHER",
    departmentId: "",
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

  const fetchDepartments = async () => {
    try {
      const res = await fetch("/api/admin/departments");
      const data = await res.json();
      if (res.ok) {
        setDepartments(data.departments || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "TEACHER",
      departmentId: departments[0]?.id || "",
    });
    setShowModal(true);
  };

  const openEditModal = (user: UserItem) => {
    setModalMode("edit");
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      departmentId: user.departmentId || "",
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
          setAlert({ type: "success", msg: "เพิ่มผู้ใช้งานเรียบร้อยแล้ว" });
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
          departmentId: formData.departmentId || null,
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
      (u.department?.nameTh || "").toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-rose-50 text-rose-700 border border-rose-200">Super Admin</span>;
      case "QA_HEAD":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-purple-50 text-purple-700 border border-purple-200">หัวหน้างานประกัน</span>;
      case "DEPT_HEAD":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-50 text-amber-700 border border-amber-200">หัวหน้าแผนก</span>;
      case "TEACHER":
        return <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-blue-50 text-blue-700 border border-blue-200">ครูผู้รับผิดชอบ</span>;
      case "AUDITOR":
        return <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">กรรมการตรวจ</span>;
      default:
        return <span className="px-2.5 py-1 text-xs rounded-md bg-slate-100 text-slate-700">{role}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="h-7 w-7 text-blue-600" />
            จัดการบัญชีผู้ใช้งาน (User Management)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            ผู้ดูแลระบบสามารถสร้าง แก้ไข มอบหมายบทบาท และจัดการสถานะผู้ใช้ของทุกแผนกวิชา
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 active:scale-[0.99]"
        >
          <UserPlus className="h-4 w-4" />
          เพิ่มผู้ใช้งานใหม่
        </button>
      </div>

      {/* Alert Banner */}
      {alert && (
        <div
          className={`flex items-center justify-between rounded-xl p-4 text-sm font-medium ${
            alert.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border border-rose-200 bg-rose-50 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {alert.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-600" />
            )}
            <span>{alert.msg}</span>
          </div>
          <button onClick={() => setAlert(null)} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาตามชื่อ, อีเมล, หรือแผนกวิชา..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 hidden sm:block" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition"
          >
            <option value="ALL">ทุกสิทธิ์การใช้งาน (All Roles)</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="QA_HEAD">หัวหน้างานประกันคุณภาพ (QA Head)</option>
            <option value="DEPT_HEAD">หัวหน้าแผนกวิชา (Dept Head)</option>
            <option value="TEACHER">ครูผู้รับผิดชอบ (Teacher)</option>
            <option value="AUDITOR">กรรมการตรวจประเมิน (Auditor)</option>
          </select>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
            <span className="text-sm font-medium">กำลังโหลดข้อมูลผู้ใช้งานจากฐานข้อมูล...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
            <Users className="h-10 w-10 text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">ไม่พบผู้ใช้งานที่ตรงกับเงื่อนไข</p>
            <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรองบทบาท</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-100 bg-slate-50/75 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">ชื่อ - สกุล / อีเมล</th>
                  <th className="px-6 py-4">สิทธิ์การใช้งาน</th>
                  <th className="px-6 py-4">แผนกวิชา</th>
                  <th className="px-6 py-4 text-center">สถานะ</th>
                  <th className="px-6 py-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{user.name}</div>
                      <div className="text-xs text-slate-400">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4">
                      {user.department ? (
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Building2 className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                          <span>{user.department.nameTh}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">- ส่วนกลาง -</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        title="คลิกเพื่อสลับสถานะ"
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold transition ${
                          user.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {user.isActive ? (
                          <>
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            เปิดใช้งาน
                          </>
                        ) : (
                          <>
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            ระงับการใช้งาน
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition"
                          title="แก้ไขข้อมูล / เปลี่ยนรหัสผ่าน"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                          title="ลบผู้ใช้งาน"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create or Edit User */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
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
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อ - นามสกุล <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="เช่น อ.สมศักดิ์ รักเรียน"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                {modalMode === "edit" && (
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    * ไม่สามารถเปลี่ยนอีเมลได้หลังจากสร้างบัญชีแล้ว
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {modalMode === "create" ? (
                    <>รหัสผ่านเริ่มต้น <span className="text-rose-500">*</span></>
                  ) : (
                    <>เปลี่ยนรหัสผ่านใหม่ (เว้นว่างไว้หากไม่ต้องการเปลี่ยน)</>
                  )}
                </label>
                <input
                  type="password"
                  required={modalMode === "create"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={modalMode === "create" ? "กำหนดรหัสผ่าน เช่น 123456" : "••••••••"}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    สิทธิ์การใช้งาน (Role)
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition"
                  >
                    <option value="TEACHER">ครูผู้รับผิดชอบ (Teacher)</option>
                    <option value="DEPT_HEAD">หัวหน้าแผนกวิชา (Dept Head)</option>
                    <option value="QA_HEAD">หัวหน้างานประกัน (QA Head)</option>
                    <option value="AUDITOR">กรรมการประเมิน (Auditor)</option>
                    <option value="SUPER_ADMIN">ผู้ดูแลระบบ (Super Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    สังกัดแผนกวิชา
                  </label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition"
                  >
                    <option value="">- ไม่มี / ส่วนกลาง -</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nameTh}
                      </option>
                    ))}
                  </select>
                </div>
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
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 active:scale-[0.99] disabled:opacity-70"
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
