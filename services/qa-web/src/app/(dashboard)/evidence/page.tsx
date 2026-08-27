import React from "react";
import { FolderArchive, Upload, FileText, Plus, ShieldCheck, Database } from "lucide-react";

export default function EvidencePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <FolderArchive className="h-7 w-7 text-purple-600" />
            คลังเอกสารและไฟล์หลักฐาน (MinIO S3 Evidence Vault)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            จัดเก็บไฟล์เอกสาร รูปภาพผลงาน คำสั่ง และรายงาน เพื่อใช้ประกอบการประเมินแต่ละตัวบ่งชี้
          </p>
        </div>

        <button className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 active:scale-[0.99]">
          <Upload className="h-4 w-4" />
          อัปโหลดไฟล์ใหม่
        </button>
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 flex items-center gap-3 text-xs text-blue-900">
        <Database className="h-5 w-5 text-blue-600 flex-shrink-0" />
        <div>
          <span className="font-bold">MinIO S3 Storage Bucket: </span>
          <code className="bg-white px-2 py-0.5 rounded border border-blue-200 font-mono text-blue-700">
            qa-evidences
          </code>
          <span className="text-slate-600 ml-2">
            (ทำงานบน Proxmox CT 102 พอร์ต 9000 เชื่อมต่อสมบูรณ์แล้ว)
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4">
          <FolderArchive className="h-7 w-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800">ยังไม่มีไฟล์หลักฐานในระบบ</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          คุณสามารถเลือกตัวบ่งชี้และอัปโหลดไฟล์ PDF, รูปภาพ หรือเอกสารอ้างอิง เพื่อประกอบการประเมินได้
        </p>
      </div>
    </div>
  );
}
