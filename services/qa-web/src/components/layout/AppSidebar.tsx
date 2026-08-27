"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Shield,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { clsx } from "clsx";
import { useSidebar } from "./SidebarContext";

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
  const userInitial = session?.user?.name ? session.user.name.charAt(0) : "U";

  const effectiveCollapsed = isMobile ? false : isCollapsed;

  const navItems = [
    {
      title: "หน้าหลัก (Dashboard)",
      href: "/dashboard",
      icon: LayoutDashboard,
      show: true,
    },
    {
      title: "จัดการผู้ใช้งาน",
      href: "/admin/users",
      icon: Users,
      show: isRoot,
      badge: "ROOT",
    },
  ];

  const handleLinkClick = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
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
        {/* Top Header: Logo & Collapse Button (Aligned with 64px Topbar) */}
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

        {/* Navigation Menu */}
        <div>
          {!effectiveCollapsed && (
            <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
              เมนูหลัก (Navigation)
            </div>
          )}

          <nav className="space-y-1.5">
            {navItems
              .filter((item) => item.show)
              .map((item) => {
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
                      "flex items-center rounded-2xl transition-all duration-150 group",
                      effectiveCollapsed
                        ? "justify-center p-3"
                        : "justify-between px-3.5 py-3 text-sm font-bold",
                      isActive
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={clsx(
                          "h-5 w-5 flex-shrink-0",
                          isActive
                            ? "text-white"
                            : "text-slate-400 group-hover:text-slate-600"
                        )}
                      />
                      {!effectiveCollapsed && <span>{item.title}</span>}
                    </div>

                    {!effectiveCollapsed && item.badge && (
                      <span
                        className={clsx(
                          "px-2 py-0.5 text-[10px] font-black rounded-md",
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
      </div>

      {/* Bottom User Card */}
      {session?.user && (
        <div className="pt-4 border-t border-slate-100">
          <div
            className={clsx(
              "rounded-2xl border border-slate-200/80 bg-slate-50/70 transition hover:bg-slate-100/70",
              effectiveCollapsed ? "p-2 flex justify-center" : "p-3.5"
            )}
            title={effectiveCollapsed ? `${session.user.name} (${session.user.role})` : undefined}
          >
            <div className="flex items-center gap-3">
              {session.user.avatarUrl ? (
                <img
                  src={session.user.avatarUrl}
                  alt={session.user.name || "Avatar"}
                  className="h-10 w-10 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-sm shadow-xs flex-shrink-0">
                  {userInitial}
                </div>
              )}

              {!effectiveCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {session.user.name}
                    </span>
                    {isRoot ? (
                      <span className="px-1.5 py-0.5 text-[9px] font-black rounded bg-rose-100 text-rose-700 flex-shrink-0">
                        ROOT
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-blue-100 text-blue-700 flex-shrink-0">
                        บุคลากร
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
                    {session.user.position || "บุคลากรวิทยาลัย"}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {session.user.email}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
