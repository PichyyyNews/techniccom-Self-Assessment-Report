import { Upload, FileText, Link2, ExternalLink, Trash2 } from "lucide-react";

export default function EvidencePage() {
  const sampleEvidences = [
    {
      id: "1",
      fileName: "รายงานผลการแข่งขันทักษะวิชาชีพ_2569.pdf",
      indicator: "1.2 (ทักษะวิชาชีพ)",
      size: "4.2 MB",
      type: "PDF Document",
      uploadedAt: "25 ส.ค. 2569",
    },
    {
      id: "2",
      fileName: "ภาพกิจกรรมโครงการFixItCenter_ตำบลท่าพระ.pdf",
      indicator: "4.1 (ศูนย์ซ่อมสร้างชุมชน)",
      size: "8.5 MB",
      type: "PDF Document",
      uploadedAt: "24 ส.ค. 2569",
    },
    {
      id: "3",
      fileName: "https://drive.google.com/drive/folders/evidence-standard-2",
      indicator: "2.3 (ระบบทวิภาคี)",
      size: "External Link",
      type: "Google Drive Folder",
      uploadedAt: "22 ส.ค. 2569",
      isLink: true,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            คลังหลักฐานร่องรอย (SAR Evidences)
          </h1>
          <p className="text-sm text-slate-500">
            จัดการไฟล์เอกสาร ภาพถ่าย และลิงก์อ้างอิงหลักฐานร่องรอยเชื่อมโยงกับตัวบ่งชี้ (MinIO S3 Storage)
          </p>
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm cursor-pointer">
          <Upload className="w-4 h-4" />
          อัปโหลดเอกสารหลักฐานใหม่
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">ชื่อไฟล์ / ลิงก์เอกสาร</th>
                <th className="px-6 py-4">ตัวบ่งชี้ที่เกี่ยวข้อง</th>
                <th className="px-6 py-4">ประเภท</th>
                <th className="px-6 py-4">ขนาด</th>
                <th className="px-6 py-4">วันที่อัปโหลด</th>
                <th className="px-6 py-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sampleEvidences.map((file) => (
                <tr key={file.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                    {file.isLink ? (
                      <Link2 className="w-5 h-5 text-blue-500 shrink-0" />
                    ) : (
                      <FileText className="w-5 h-5 text-red-500 shrink-0" />
                    )}
                    <span className="truncate max-w-xs sm:max-w-md">{file.fileName}</span>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-700">{file.indicator}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{file.type}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{file.size}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{file.uploadedAt}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg cursor-pointer">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
