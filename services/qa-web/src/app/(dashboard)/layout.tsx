import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { TeacherSidebar } from "@/components/layout/TeacherSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar areaTitle="พอร์ทัลงานประกันคุณภาพแผนกวิชา" />
      <div className="flex flex-1">
        <TeacherSidebar />
        <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
