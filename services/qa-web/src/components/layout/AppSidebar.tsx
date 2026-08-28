"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  FileBadge,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  Server,
  Layers,
  Sparkles,
} from "lucide-react";
import { clsx } from "clsx";
import { useSidebar } from "./SidebarContext";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
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

  const isRoot = session?.user?.role === "ROOT";
  const userPermissions = session?.user?.permissions || ["/dashboard"];
  const canManageUsers = isRoot || userPermissions.includes("/admin/users");
  const canManageLicenses =
    isRoot || userPermissions.includes("/admin/licenses") || userPermissions.includes("/admin/users");
  const canAccessDashboard = isRoot || userPermissions.includes("/dashboard");

  const userInitial = session?.user?.name ? session.user.name.charAt(0) : "U";
  const effectiveCollapsed = isMobile ? false : isCollapsed;

  // Grouped Navigation Structure
  const navGroups: NavGroup[] = [
    {
      groupTitle: "ภาพรวมระบบ (OVERVIEW)",
      items: [
        {
          title: "หน้าหลัก (Dashboard)",
          href: "/dashboard",
          icon: LayoutDashboard,
          show: canAccessDashboard,
        },
        {
          title: "โปรไฟล์และผลงาน",
          href: "/profile",
          icon: User,
          show: true,
        },
      ],
    },
    {
      groupTitle: "การบริหารข้อมูลบุคลากร (MANAGEMENT)",
      items: [
        {
          title: "จัดการผู้ใช้และสิทธิ์",
          href: "/admin/users",
          icon: Users,
          show: canManageUsers,
          badge: isRoot ? "ROOT" : undefined,
        },
        {
          title: "ประเภทใบอนุญาต & มาตรฐาน",
          href: "/admin/licenses",
          icon: FileBadge,
          show: canManageLicenses,
          badge: isRoot ? "ROOT" : undefined,
        },
      ],
    },
    {
      groupTitle: "โครงสร้างพื้นฐาน & ระบบ (INFRASTRUCTURE)",
      items: [
        {
          title: "ตั้งค่าระบบ & มอนิเตอร์",
          href: "/admin/system",
          icon: Server,
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

  const getRoleBadgeStyle = (color?: string | null, isRootUser?: boolean) => {
    if (isRootUser || color === "rose") return "bg-rose-50 text-rose-700 border border-rose-200";
    if (color === "purple") return "bg-purple-50 text-purple-700 border border-purple-200";
    if (color === "emerald") return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    if (color === "teal") return "bg-teal-50 text-teal-700 border border-teal-200";
    if (color === "amber") return "bg-amber-50 text-amber-700 border border-amber-200";
    return "bg-blue-50 text-blue-700 border border-blue-200";
  };

  return (
    <aside
      className={clsx(
        "flex flex-col justify-between border-r border-slate-200 bg-white transition-all duration-200 ease-in-out select-none",
        isMobile
          ? "w-72 h-full p-5"
          : effectiveCollapsed
          ? "w-20 h-screen p-3"
          : "w-72 h-screen p-5",
        className
      )}
    >
      <div className="space-y-6">
        {/* Top Header: Logo & Collapse Button */}
        <div className="flex h-12 items-center justify-between pb-3 border-b border-slate-100">
          <Link
            href="/dashboard"
            onClick={handleLinkClick}
            className={clsx(
              "flex items-center gap-2.5 font-bold transition hover:opacity-85",
              effectiveCollapsed && "mx-auto"
            )}
            title="TechSAR - หน้าหลัก"
          >
            <img
              src="/logo.svg"
              alt="TechSAR Logo"
              className="h-10 w-10 object-contain flex-shrink-0"
            />

            {!effectiveCollapsed && (
              <div className="overflow-hidden whitespace-nowrap animate-in fade-in duration-200">
                <div className="text-base tracking-tight text-blue-900 font-extrabold leading-none">
                  TechSAR
                </div>
                <div className="text-[10px] text-slate-400 font-semibold mt-1">
                  ระบบงานประกันคุณภาพ
                </div>
              </div>
            )}
          </Link>

          {/* Collapse/Expand Toggle Button (Desktop Only) */}
          {!isMobile && (
            <button
              type="button"
              onClick={toggleCollapse}
              className={clsx(
                "p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition shadow-2xs",
                effectiveCollapsed && "hidden"
              )}
              title="ย่อแถบเมนู (Collapse Sidebar)"
              aria-label="Toggle Sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Expand button when collapsed (Center top) */}
        {!isMobile && effectiveCollapsed && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={toggleCollapse}
              className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition shadow-2xs"
              title="ขยายแถบเมนู (Expand Sidebar)"
              aria-label="Expand Sidebar"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Grouped Navigation Menu */}
        <div className="space-y-5 overflow-y-auto max-h-[calc(100vh-220px)] pr-0.5 no-scrollbar">
          {navGroups.map((group, groupIdx) => {
            const visibleItems = group.items.filter((item) => item.show);
            if (visibleItems.length === 0) return null;

            return (
              <div key={groupIdx} className="space-y-1.5">
                {/* Group Title (Hidden when collapsed) */}
                {!effectiveCollapsed && (
                  <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                    {group.groupTitle}
                  </div>
                )}

                {/* Group Divider when collapsed */}
                {effectiveCollapsed && groupIdx > 0 && (
                  <div className="w-8 h-px bg-slate-200 mx-auto my-2" />
                )}

                <nav className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/dashboard" && pathname.startsWith(item.href));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={handleLinkClick}
                        title={effectiveCollapsed ? item.title : undefined}
                        className={clsx(
                          "flex items-center rounded-2xl transition-all duration-150 group select-none",
                          effectiveCollapsed
                            ? "justify-center p-3"
                            : "justify-between px-3.5 py-2.5 text-xs font-bold",
                          isActive
                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={clsx(
                              "h-4 w-4 sm:h-4.5 sm:w-4.5 flex-shrink-0",
                              isActive
                                ? "text-white"
                                : "text-slate-400 group-hover:text-slate-600"
                            )}
                          />
                          {!effectiveCollapsed && (
                            <span className="truncate">{item.title}</span>
                          )}
                        </div>

                        {!effectiveCollapsed && item.badge && (
                          <span
                            className={clsx(
                              "px-1.5 py-0.5 text-[9px] font-black rounded-md flex-shrink-0 ml-1",
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom User Card */}
      {session?.user && (
        <div className="pt-3 border-t border-slate-100">
          <Link
            href="/profile"
            onClick={handleLinkClick}
            className={clsx(
              "block rounded-2xl border border-slate-200/80 bg-slate-50/70 transition hover:bg-slate-100/80 group",
              effectiveCollapsed ? "p-2 flex justify-center" : "p-3"
            )}
            title={effectiveCollapsed ? `${session.user.name} (${session.user.roleTitle || session.user.role})` : undefined}
          >
            <div className="flex items-center gap-2.5">
              {session.user.avatarUrl ? (
                <img
                  src={session.user.avatarUrl}
                  alt={session.user.name || "Avatar"}
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = "none";
                    if (target.nextElementSibling) {
                      (target.nextElementSibling as HTMLElement).style.display = "flex";
                    }
                  }}
                  className="h-9 w-9 rounded-xl object-cover border border-slate-200 flex-shrink-0 bg-white"
                />
              ) : null}
              <div
                style={{ display: session.user.avatarUrl ? "none" : "flex" }}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-xs shadow-xs flex-shrink-0"
              >
                {userInitial}
              </div>

              {!effectiveCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition">
                      {session.user.name}
                    </span>
                    <span
                      className={clsx(
                        "px-1.5 py-0.5 text-[9px] font-black rounded flex-shrink-0 truncate max-w-[85px]",
                        getRoleBadgeStyle(session.user.roleColor, isRoot)
                      )}
                    >
                      {session.user.roleTitle || (isRoot ? "ROOT" : "บุคลากร")}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
                    {session.user.position || "บุคลากรวิทยาลัย"}
                  </div>
                </div>
              )}
            </div>
          </Link>
        </div>
      )}
    </aside>
  );
}
