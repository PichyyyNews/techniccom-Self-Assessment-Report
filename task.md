# TechSAR Phase 1 — Foundation & Context (COMPLETED)

## เฟส 1.1 — บริบทแผนกวิชา (Department Profile) ✅
- [x] สร้าง `DepartmentProfile` model ใน `schema.prisma`
- [x] `prisma db push` ซิงค์กับ PostgreSQL บน Proxmox สำเร็จ
- [x] สร้าง API: `GET|PUT /api/admin/department` พร้อมข้อมูลตั้งต้นมาตรฐาน
- [x] สร้างหน้า `/admin/department/page.tsx` (ข้อมูลทั่วไป, ผู้บริหาร, ห้องปฏิบัติการ, เป้าหมาย SAR)
- [x] เพิ่มเมนู Sidebar "ข้อมูลและบริบทแผนกวิชา" + อัปเดต Matrix สิทธิ์ `admin.department`

## เฟส 1.2 — Dashboard นักเรียนดึงข้อมูลจริง ✅
- [x] เพิ่มการคำนวณ `attendanceRate` และ `studentWorkCount` ใน `/api/students/stats`
- [x] ปรับ `/dashboard/students/page.tsx` ให้เชื่อมต่อข้อมูลจริงจากฐานข้อมูล แสดงสถิติผู้เรียนจริง อัตราคงอยู่จริง และจำนวนชิ้นงานสมรรถนะจริง

## เฟส 1.3 — KPI ครูคำนวณจากข้อมูลจริง ✅
- [x] สร้าง API: `GET /api/teachers/summary` คำนวณแผนการสอน, ชั่วโมงอบรม, วุฒิบัตร, และงานวิจัย
- [x] ปรับ `/teachers/lesson-plans/page.tsx` ให้แสดงจำนวนแผนการสอนจริง และ % ความพร้อมเอกสาร
- [x] ปรับ `/teachers/trainings/page.tsx` ให้รวมชั่วโมงอบรมสะสมจริง และจำนวนวุฒิบัตรจริง
- [x] ปรับ `/teachers/researches/page.tsx` ให้แสดงจำนวนผลงานวิจัยและรางวัลจริง

## เฟส 1.4 — เพิ่ม trainingHours ในฟอร์มอัปโหลด ✅
- [x] เพิ่มช่อง "จำนวนชั่วโมงอบรม (ชม.)" ใน Quick Upload หมวดการอบรม/วิทยากร
- [x] บันทึกค่าลง `metadata.trainingHours` ใน `EvidenceFile`

## Verification ✅
- [x] `npm run build` ผ่าน 100% (49 routes compiled successfully)
- [x] Dev Server เริ่มทำงานพร้อมให้ทดสอบที่ `http://localhost:3000`
