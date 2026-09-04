"use client";

import React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import { SidebarProvider, useSidebar } from "./SidebarContext";
import { AcademicYearProvider } from "./AcademicYearContext";
import { AppSidebar } from "./AppSidebar";
import { Navbar } from "./Navbar";

function AppShellContent({ children }: { children: React.ReactNode }) {
  const { isMobileOpen, setMobileOpen } = useSidebar();

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      {/* 1. Desktop Left Sidebar */}
      <Box sx={{ display: { xs: "none", md: "block" }, position: "sticky", top: 0, height: "100vh", zIndex: 20 }}>
        <AppSidebar />
      </Box>

      {/* 2. Mobile Sidebar Drawer (MUI Drawer) */}
      <Drawer
        anchor="left"
        open={isMobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { xs: "block", md: "none" } }}
        slotProps={{
          paper: {
            sx: { width: 280, bgcolor: "background.paper", backgroundImage: "none" },
          },
        }}
      >
        <AppSidebar isMobile={true} />
      </Drawer>

      {/* 3. Main Content Area */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, minHeight: "100vh" }}>
        <Navbar />
        <Box component="main" sx={{ flex: 1, width: "100%", overflowY: "auto" }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AcademicYearProvider>
        <AppShellContent>{children}</AppShellContent>
      </AcademicYearProvider>
    </SidebarProvider>
  );
}
