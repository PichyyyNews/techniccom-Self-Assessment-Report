export default function StandardsPage() {
  const standards = [
    {
      number: 1,
      title: "มาตรฐานที่ 1: คุณลักษณะของผู้สำเร็จการศึกษาอาชีวศึกษาที่พึงประสงค์",
      weight: 30,
      indicators: [
        { code: "1.1", title: "ด้านความรู้และผลสัมฤทธิ์ทางการเรียน (V-NET และ GPA)" },
        { code: "1.2", title: "ด้านทักษะวิชาชีพและสมรรถนะตามมาตรฐานอาชีพ" },
        { code: "1.3", title: "ด้านคุณธรรม จริยธรรม และคุณลักษณะที่พึงประสงค์" },
        { code: "1.4", title: "ด้านนวัตกรรม สิ่งประดิษฐ์ งานสร้างสรรค์ หรืองานวิจัยของผู้เรียน" },
        { code: "1.5", title: "ด้านการมีงานทำและศึกษาต่อของผู้สำเร็จการศึกษา" },
      ],
    },
    {
      number: 2,
      title: "มาตรฐานที่ 2: การจัดการอาชีวศึกษา",
      weight: 30,
      indicators: [
        { code: "2.1", title: "ด้านการพัฒนาและปรับปรุงหลักสูตรฐานสมรรถนะ" },
        { code: "2.2", title: "ด้านการจัดการเรียนรู้มุ่งเน้นสมรรถนะและ Active Learning" },
        { code: "2.3", title: "ด้านการจัดการศึกษาระบบทวิภาคีและเครือข่ายความร่วมมือ" },
        { code: "2.4", title: "ด้านการวัดและประเมินผลการเรียนรู้ตามสภาพจริง" },
        { code: "2.5", title: "ด้านการพัฒนาครูและบุคลากรทางการศึกษา" },
        { code: "2.6", title: "ด้านอาคารสถานที่ ห้องปฏิบัติการ และสิ่งอำนวยความสะดวก" },
      ],
    },
    {
      number: 3,
      title: "มาตรฐานที่ 3: การสร้างสังคมแห่งการเรียนรู้",
      weight: 15,
      indicators: [
        { code: "3.1", title: "ด้านการจัดการความรู้และบริการวิชาการ" },
        { code: "3.2", title: "ด้านการวิจัย นวัตกรรม และสิ่งประดิษฐ์ของครู" },
        { code: "3.3", title: "ด้านการใช้เทคโนโลยีดิจิทัลเพื่อการเรียนรู้" },
      ],
    },
    {
      number: 4,
      title: "มาตรฐานที่ 4: การบริการวิชาชีพและจิตอาสา",
      weight: 15,
      indicators: [
        { code: "4.1", title: "ด้านการบริการวิชาการและวิชาชีพสู่ชุมชน (Fix It Center)" },
        { code: "4.2", title: "ด้านการจัดฝึกอบรมวิชาชีพระยะสั้นแก่ประชาชน" },
        { code: "4.3", title: "ด้านจิตอาสาและการทำนุบำรุงศิลปวัฒนธรรม" },
      ],
    },
    {
      number: 5,
      title: "มาตรฐานที่ 5: การบริหารจัดการและภาวะผู้นำ",
      weight: 10,
      indicators: [
        { code: "5.1", title: "ด้านการจัดทำแผนปฏิบัติการประจำปีและการบริหารจัดการ" },
        { code: "5.2", title: "ด้านระบบการประกันคุณภาพภายในและการประเมินตนเอง (SAR)" },
        { code: "5.3", title: "ด้านการกำกับ ติดตาม และการนำผลประเมินไปใช้ปรับปรุง" },
      ],
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          เกณฑ์มาตรฐานและตัวบ่งชี้การประกันคุณภาพการศึกษา (สอศ.)
        </h1>
        <p className="text-sm text-slate-500">
          โครงสร้าง 5 มาตรฐาน 21 ตัวบ่งชี้ พร้อมค่าน้ำหนักสำหรับการคำนวณผลการประเมินตนเอง (SAR)
        </p>
      </div>

      <div className="space-y-6">
        {standards.map((std) => (
          <div key={std.number} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                  {std.number}
                </div>
                <h2 className="text-base font-bold text-slate-900">{std.title}</h2>
              </div>
              <div className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 rounded-full w-fit">
                ค่าน้ำหนัก: {std.weight}%
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {std.indicators.map((ind) => (
                <div
                  key={ind.code}
                  className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <span className="font-bold text-blue-600 text-xs mt-0.5 shrink-0">
                    {ind.code}
                  </span>
                  <span className="text-xs font-medium text-slate-800 leading-relaxed">
                    {ind.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
