"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  GraduationCap,
  User,
  BookOpen,
  Award,
  Lightbulb,
  Users,
  CheckSquare,
  Trophy,
  Flag,
  ShieldCheck,
  FileBadge,
  Server,
  Calendar,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
} from "lucide-react";
import { clsx } from "clsx";
import { useSidebar } from "./SidebarContext";
import { useAcademicYear } from "./AcademicYearContext";

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
  const { shortTermLabel } = useAcademicYear();

  const isRoot = session?.user?.role === "ROOT";
  const userPermissions = session?.user?.permissions || ["/dashboard"];
  const canManageUsers = isRoot || userPermissions.includes("/admin/users");
  const canManageLicenses =
    isRoot || userPermissions.includes("/admin/licenses") || userPermissions.includes("/admin/users");
  const canAccessDashboard = isRoot || userPermissions.includes("/dashboard");

  const userInitial = session?.user?.name ? session.user.name.charAt(0) : "U";
  const effectiveCollapsed = isMobile ? false : isCollapsed;

  // Grouped Navigation Structure: 4 Groups (Dual Overview + Teacher System + Student System + Administration)
  const navGroups: NavGroup[] = [
    {
      groupTitle: "ภาพรวมระบบ (OVERVIEW)",
      items: [
        {
          title: "ภาพรวมงานครู/บุคลากร",
          href: "/dashboard",
          icon: LayoutDashboard,
          show: canAccessDashboard,
        },
        {
          title: "ภาพรวมงานนักเรียน/นศ.",
          href: "/dashboard/students",
          icon: GraduationCap,
          show: canAccessDashboard,
          badge: "ใหม่",
        },
      ],
    },
    {
      groupTitle: "ระบบงานครู & บุคลากร (TEACHER)",
      items: [
        {
          title: "โปรไฟล์และผลงานครู",
          href: "/profile",
          icon: User,
          show: true,
        },
        {
          title: "แผนการสอน & หลังสอน",
          href: "/teachers/lesson-plans",
          icon: BookOpen,
          show: true,
        },
        {
          title: "การพัฒนาวิชาชีพ & อบรม",
          href: "/teachers/trainings",
          icon: Award,
          show: true,
        },
        {
          title: "งานวิจัย & สิ่งประดิษฐ์",
          href: "/teachers/researches",
          icon: Lightbulb,
          show: true,
        },
      ],
    },
    {
      groupTitle: "ระบบงานนักเรียน & นักศึกษา (STUDENT)",
      items: [
        {
          title: "ทะเบียนข้อมูลนักเรียน",
          href: "/students",
          icon: Users,
          show: true,
        },
        {
          title: "เช็คชื่อเข้าเรียน & พฤติกรรม",
          href: "/students/attendance",
          icon: CheckSquare,
          show: true,
        },
        {
          title: "ผลสัมฤทธิ์ & สมรรถนะ",
          href: "/students/competencies",
          icon: Trophy,
          show: true,
        },
        {
          title: "กิจกรรมผู้เรียน & หน้าเสาธง",
          href: "/students/activities",
          icon: Flag,
          show: true,
        },
      ],
    },
    {
      groupTitle: "การบริหารระบบ & สิทธิ์ (ADMIN)",
      items: [
        {
          title: "จัดการผู้ใช้และสิทธิ์",
          href: "/admin/users",
          icon: ShieldCheck,
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
      <div className="space-y-4">
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
              className="h-9 w-9 object-contain flex-shrink-0"
            />

            {!effectiveCollapsed && (
              <div className="overflow-hidden whitespace-nowrap animate-in fade-in duration-200">
                <div className="text-base tracking-tight text-blue-900 font-extrabold leading-none">
                  TechSAR
                </div>
                <div className="text-[10px] text-slate-400 font-semibold mt-1">
                  ระบบประกันคุณภาพตามเกณฑ์ SAR
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

        {/* Active Term Indicator Banner (when not collapsed) */}
        {!effectiveCollapsed && (
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 font-medium truncate">
              <Calendar className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
              <span className="truncate">{shortTermLabel}</span>
            </div>
            <span className="px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-black uppercase flex-shrink-0">
              SAR
            </span>
          </div>
        )}

        {/* Grouped Navigation Menu with scrollable area */}
        <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-250px)] pr-0.5 no-scrollbar">
          {navGroups.map((group, groupIdx) => {
            const visibleItems = group.items.filter((item) => item.show);
            if (visibleItems.length === 0) return null;

            return (
              <div key={groupIdx} className="space-y-1">
                {/* Group Section Header */}
                {!effectiveCollapsed ? (
                  <div className="px-3 pt-2 pb-1 text-[10px] font-black tracking-wider text-slate-400 uppercase">
                    {group.groupTitle}
                  </div>
                ) : (
                  <div className="my-2 border-t border-slate-100 mx-2" />
                )}

                {/* Group Menu Items */}
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/dashboard" && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={handleLinkClick}
                        title={effectiveCollapsed ? item.title : undefined}
                        className={clsx(
                          "group flex items-center gap-2.5 rounded-xl py-2 font-medium text-xs transition-all relative",
                          effectiveCollapsed ? "justify-center px-2" : "px-3",
                          isActive
                            ? "bg-blue-600 text-white font-bold shadow-xs shadow-blue-200"
                            : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                        )}
                      >
                        <Icon
                          className={clsx(
                            "h-4 w-4 flex-shrink-0 transition",
                            isActive
                              ? "text-white"
                              : "text-slate-400 group-hover:text-slate-700"
                          )}
                        />

                        {!effectiveCollapsed && (
                          <span className="truncate flex-1">{item.title}</span>
                        )}

                        {/* Badges */}
                        {!effectiveCollapsed && item.badge && (
                          <span
                            className={clsx(
                              "text-[10px] font-black px-1.5 py-0.5 rounded-md uppercase leading-none",
                              isActive
                                ? "bg-white/25 text-white"
                                : item.badge === "ใหม่"
                                ? "bg-emerald-100 text-emerald-700"
                                : item.badge === "ROOT"
                                ? "bg-rose-100 text-rose-700"
                                : "bg-blue-100 text-blue-700"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}

                        {/* Collapsed Active Indicator Dot */}
                        {effectiveCollapsed && isActive && (
                          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom User Profile Section */}
      <div className="pt-3 border-t border-slate-100">
        {session?.user ? (
          <Link
            href="/profile"
            onClick={handleLinkClick}
            className={clsx(
              "flex items-center gap-3 p-2 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100 hover:border-slate-200 transition group",
              effectiveCollapsed ? "justify-center" : "justify-between"
            )}
            title={effectiveCollapsed ? session.user.name || "โปรไฟล์" : undefined}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
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
                  className="h-8 w-8 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                />
              ) : null}
              <div
                style={{ display: session.user.avatarUrl ? "none" : "flex" }}
                className="h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-xs shadow-2xs flex-shrink-0"
              >
                {userInitial}
              </div>

              {!effectiveCollapsed && (
                <div className="overflow-hidden text-left">
                  <p className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition">
                    {session.user.name}
                  </p>
                  <span
                    className={clsx(
                      "inline-flex items-center px-1.5 py-0.2 rounded-md text-[9px] font-bold mt-0.5",
                      getRoleBadgeStyle(session.user.roleColor, isRoot)
                    )}
                  >
                    {isRoot ? "ROOT" : session.user.roleTitle || "บุคลากร"}
                  </span>
                </div>
              )}
            </div>
          </Link>
        ) : (
          <Link
            href="/login"
            className={clsx(
              "flex items-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95",
              effectiveCollapsed ? "justify-center px-2" : "justify-center px-4"
            )}
          >
            <User className="h-4 w-4" />
            {!effectiveCollapsed && <span>เข้าสู่ระบบ</span>}
          </Link>
        )}
      </div>
    </aside>
  );
}
