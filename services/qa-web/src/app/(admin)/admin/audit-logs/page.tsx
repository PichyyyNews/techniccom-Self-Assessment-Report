import React from "react";
import { Activity, ShieldAlert, History, Clock } from "lucide-react";

export default function AdminAuditLogsPage() {
  const sampleLogs = [
    {
      id: "log-1",
      action: "ระบบเริ่มทำงาน",
      details: "ติดตั้งระบบ TechSAR บน Proxmox CT 102 (PostgreSQL + MinIO)",
      user: "Root Admin (admin@technic.ac.th)",
      time: "เมื่อสักครู่",
      type: "SYSTEM",
    },
    {
      id: "log-2",
      action: "ซิงก์ฐานข้อมูลและสร้างตาราง",
      details: "รัน Prisma db push และ Seed ข้อมูลเกณฑ์ สอศ. 5 ด้าน 21 ตัวบ่งชี้",
      user: "Root Admin",
      time: "เมื่อสักครู่",
      type: "DATABASE",
    },
    {
      id: "log-3",
      action: "เปิดใช้งานรอบปีการศึกษา 2569",
      details: "กำหนดรอบประเมินตนเองสำหรับ 5 แผนกวิชา",
      user: "หัวหน้างานประกัน (qa.head@technic.ac.th)",
      time: "เมื่อสักครู่",
      type: "ACADEMIC",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
          <Activity className="h-7 w-7 text-blue-600" />
          ประวัติการดำเนินงานในระบบ (System Audit Logs)
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          บันทึกกิจกรรมและการเปลี่ยนแปลงข้อมูลสำคัญเพื่อความโปร่งใสและตรวจสอบย้อนหลังได้
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div className="divide-y divide-slate-100">
          {sampleLogs.map((log) => (
            <div key={log.id} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 flex-shrink-0 mt-0.5">
                <History className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">{log.action}</h4>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="h-3 w-3" />
                    {log.time}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{log.details}</p>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-700">โดย: {log.user}</span>
                  <span>•</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] font-bold text-slate-600">
                    {log.type}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
