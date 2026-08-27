"use client";

import React from "react";
import { SidebarProvider, useSidebar } from "./SidebarContext";
import { AppSidebar } from "./AppSidebar";
import { Navbar } from "./Navbar";

function AppShellContent({ children }: { children: React.ReactNode }) {
  const { isMobileOpen, setMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex flex-1 relative">
        {/* Desktop Sidebar (Collapsible: w-72 or w-20) */}
        <AppSidebar className="hidden md:flex" />

        {/* Mobile Sidebar Overlay Drawer */}
        {isMobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex animate-in fade-in duration-150">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative z-50 flex h-full shadow-2xl animate-in slide-in-from-left duration-200">
              <AppSidebar isMobile={true} />
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

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppShellContent>{children}</AppShellContent>
    </SidebarProvider>
  );
}
