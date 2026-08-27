import {
  FileCheck,
  FolderArchive,
  CheckCircle2,
  Clock,
  TrendingUp,
  Award,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

export default function DashboardOverviewPage() {
  const stats = [
    {
      title: "คะแนนเฉลี่ยรวม (SAR Score)",
      value: "4.65 / 5.00",
      subtext: "ระดับคุณภาพ: ยอดเยี่ยม",
      icon: Award,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 border-emerald-200",
    },
    {
      title: "ความคืบหน้าการประเมิน",
      value: "18 / 21 ตัวบ่งชี้",
      subtext: "บันทึกผลแล้ว 85.7%",
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50 border-blue-200",
    },
    {
      title: "หลักฐานร่องรอยที่แนบ",
      value: "42 รายการ",
      subtext: "ไฟล์เอกสารและลิงก์อ้างอิง",
      icon: FolderArchive,
      color: "text-purple-600",
      bgColor: "bg-purple-50 border-purple-200",
    },
    {
      title: "สถานะการตรวจประเมิน",
      value: "รอตรวจสอบ",
      subtext: "3 ตัวบ่งชี้รอส่งผล",
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50 border-amber-200",
    },
  ];

  const standardsProgress = [
    { number: 1, title: "คุณลักษณะของผู้สำเร็จการศึกษา", score: 4.80, progress: 95, color: "bg-blue-600" },
    { number: 2, title: "การจัดการอาชีวศึกษา", score: 4.55, progress: 88, color: "bg-indigo-600" },
    { number: 3, title: "การสร้างสังคมแห่งการเรียนรู้", score: 4.40, progress: 80, color: "bg-emerald-600" },
    { number: 4, title: "การบริการวิชาชีพและจิตอาสา", score: 4.90, progress: 100, color: "bg-purple-600" },
    { number: 5, title: "การบริหารจัดการและภาวะผู้นำ", score: 4.60, progress: 75, color: "bg-amber-600" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            ภาพรวมงานประกันคุณภาพการศึกษา (SAR Dashboard)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            แผนกวิชาเทคโนโลยีคอมพิวเตอร์ • ปีการศึกษา 2569 (ตามเกณฑ์มาตรฐาน สอศ.)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/sar"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            <FileCheck className="w-4 h-4" />
            บันทึกผลการประเมิน SAR
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {stat.title}
                </span>
                <div className={`w-9 h-9 rounded-xl ${stat.bgColor} border flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs text-slate-500 mt-1">{stat.subtext}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Standards Progress & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Standards Progress */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                ผลการประเมินจำแนกตามมาตรฐาน สอศ. 5 ด้าน
              </h2>
              <p className="text-xs text-slate-500">
                เปรียบเทียบคะแนนเฉลี่ยและความคืบหน้าการกรอกข้อมูล
              </p>
            </div>
            <Link
              href="/dashboard/standards"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              ดูเกณฑ์ทั้งหมด <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-5">
            {standardsProgress.map((std) => (
              <div key={std.number} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="font-medium text-slate-800">
                    <span className="font-bold text-blue-600 mr-2">มาตรฐานที่ {std.number}:</span>
                    {std.title}
                  </div>
                  <div className="text-right font-semibold text-slate-900">
                    {std.score.toFixed(2)} <span className="text-xs text-slate-400 font-normal">/ 5.00</span>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${std.color} transition-all duration-500`}
                    style={{ width: `${std.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Audit & Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1">
              ขั้นตอนการดำเนินงาน SAR
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              สถานะกระบวนการจัดทำรายงานประจำปี
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800">1. มอบหมายตัวบ่งชี้</div>
                  <div className="text-[11px] text-slate-500">กำหนดครูผู้รับผิดชอบ 21 ตัวบ่งชี้</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-blue-600">2. บันทึกผล & แนบหลักฐาน (กำลังดำเนินการ)</div>
                  <div className="text-[11px] text-slate-500">รวบรวมไฟล์และกรอกแบบประเมินตนเอง</div>
                </div>
              </div>

              <div className="flex items-start gap-3 opacity-60">
                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold">3</span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-700">3. ตรวจประเมินภายใน</div>
                  <div className="text-[11px] text-slate-500">คณะกรรมการตรวจสอบและให้ข้อเสนอแนะ</div>
                </div>
              </div>

              <div className="flex items-start gap-3 opacity-60">
                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold">4</span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-700">4. จัดทำเล่มรายงาน SAR</div>
                  <div className="text-[11px] text-slate-500">Export เล่มรายงานเพื่อนำเสนอผู้บริหาร</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link
              href="/dashboard/evidence"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              <FolderArchive className="w-4 h-4 text-purple-600" />
              เปิดคลังหลักฐานร่องรอย
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
