"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { AppSidebar } from "@/components/layout/AppSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onMobileMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
      <div className="flex flex-1 relative">
        {/* Desktop Sidebar */}
        <AppSidebar className="hidden md:flex" />

        {/* Mobile Sidebar Modal/Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative z-50 flex">
              <AppSidebar />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
