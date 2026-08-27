"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Shield,
  Briefcase,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { clsx } from "clsx";

export function AppSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isRoot = session?.user?.role === "ROOT";
  const userInitial = session?.user?.name ? session.user.name.charAt(0) : "U";

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

  return (
    <aside
      className={clsx(
        "w-72 flex-shrink-0 border-r border-slate-200 bg-white min-h-[calc(100vh-4rem)] p-5 flex flex-col justify-between select-none",
        className
      )}
    >
      <div className="space-y-6">
        {/* Navigation Menu */}
        <div>
          <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            เมนูหลัก (Navigation)
          </div>
          <nav className="mt-3 space-y-1.5">
            {navItems
              .filter((item) => item.show)
              .map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      "flex items-center justify-between rounded-2xl px-3.5 py-3 text-sm font-bold transition-all duration-150 group",
                      isActive
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={clsx("h-5 w-5", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
                      <span>{item.title}</span>
                    </div>

                    {item.badge && (
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

      {/* Bottom Profile Badge & Info Card */}
      {session?.user && (
        <div className="pt-4 border-t border-slate-100">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 transition hover:bg-slate-100/70">
            <div className="flex items-start gap-3">
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

                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                  {session.user.position || "บุคลากรวิทยาลัย"}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {session.user.email}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
