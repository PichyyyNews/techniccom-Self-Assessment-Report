import { FileCheck, CheckCircle, Clock } from "lucide-react";

export default function SarEvaluationPage() {
  const indicatorsList = [
    { code: "1.1", title: "ด้านความรู้และผลสัมฤทธิ์ทางการเรียน (V-NET และ GPA)", standard: "มาตรฐานที่ 1", selfScore: 4.5, status: "COMPLETED" },
    { code: "1.2", title: "ด้านทักษะวิชาชีพและสมรรถนะตามมาตรฐานอาชีพ", standard: "มาตรฐานที่ 1", selfScore: 5.0, status: "COMPLETED" },
    { code: "1.3", title: "ด้านคุณธรรม จริยธรรม และคุณลักษณะที่พึงประสงค์", standard: "มาตรฐานที่ 1", selfScore: 4.8, status: "COMPLETED" },
    { code: "1.4", title: "ด้านนวัตกรรม สิ่งประดิษฐ์ งานสร้างสรรค์ หรืองานวิจัยของผู้เรียน", standard: "มาตรฐานที่ 1", selfScore: 5.0, status: "COMPLETED" },
    { code: "1.5", title: "ด้านการมีงานทำและศึกษาต่อของผู้สำเร็จการศึกษา", standard: "มาตรฐานที่ 1", selfScore: 4.7, status: "COMPLETED" },
    { code: "2.1", title: "ด้านการพัฒนาและปรับปรุงหลักสูตรฐานสมรรถนะ", standard: "มาตรฐานที่ 2", selfScore: 4.5, status: "COMPLETED" },
    { code: "2.2", title: "ด้านการจัดการเรียนรู้มุ่งเน้นสมรรถนะและ Active Learning", standard: "มาตรฐานที่ 2", selfScore: 4.6, status: "COMPLETED" },
    { code: "2.3", title: "ด้านการจัดการศึกษาระบบทวิภาคีและเครือข่ายความร่วมมือ", standard: "มาตรฐานที่ 2", selfScore: 4.8, status: "COMPLETED" },
    { code: "2.4", title: "ด้านการวัดและประเมินผลการเรียนรู้ตามสภาพจริง", standard: "มาตรฐานที่ 2", selfScore: 4.2, status: "PENDING" },
    { code: "2.5", title: "ด้านการพัฒนาครูและบุคลากรทางการศึกษา", standard: "มาตรฐานที่ 2", selfScore: null, status: "NOT_STARTED" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            แบบประเมินตนเองระดับแผนกวิชา (SAR Indicators)
          </h1>
          <p className="text-sm text-slate-500">
            บันทึกผลการดำเนินงาน แนบหลักฐานร่องรอย และระบุระดับคะแนนตามตัวบ่งชี้
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">รหัสตัวบ่งชี้</th>
                <th className="px-6 py-4">ชื่อตัวบ่งชี้ / ประเด็นการประเมิน</th>
                <th className="px-6 py-4">มาตรฐาน</th>
                <th className="px-6 py-4 text-center">คะแนนประเมินตนเอง</th>
                <th className="px-6 py-4 text-center">สถานะ</th>
                <th className="px-6 py-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {indicatorsList.map((item) => (
                <tr key={item.code} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-blue-600">{item.code}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{item.title}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{item.standard}</td>
                  <td className="px-6 py-4 text-center font-semibold">
                    {item.selfScore !== null ? (
                      <span className="text-slate-900">{item.selfScore.toFixed(2)} / 5.00</span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {item.status === "COMPLETED" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle className="w-3.5 h-3.5" /> บันทึกแล้ว
                      </span>
                    )}
                    {item.status === "PENDING" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3.5 h-3.5" /> กำลังดำเนินการ
                      </span>
                    )}
                    {item.status === "NOT_STARTED" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        ยังไม่เริ่ม
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                      แก้ไข / บันทึกผล
                    </button>
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
