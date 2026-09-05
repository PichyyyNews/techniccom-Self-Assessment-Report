/**
 * TechSAR Role & Permission System Specification
 * Action-based Permission Matrix (Read vs Edit/Action) with Role Presets
 */

export type PermissionActionType = "read" | "edit" | "admin";

export interface PermissionDefinition {
  key: string;
  title: string;
  description: string;
  type: PermissionActionType;
}

export interface PermissionCategory {
  id: string;
  title: string;
  description: string;
  iconName: string;
  items: PermissionDefinition[];
}

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    id: "academic_year",
    title: "1. รอบปีการศึกษาและภาคเรียน",
    description: "การดูและจัดการปีการศึกษา พ.ศ. และเทอมของสถานศึกษา",
    iconName: "CalendarToday",
    items: [
      {
        key: "academic_year.view",
        title: "ดูรอบปีการศึกษาและเทอม (Read Only)",
        description: "ดูรายการปีการศึกษาและเทอมที่เปิดใช้งานในระบบ",
        type: "read",
      },
      {
        key: "academic_year.manage",
        title: "จัดการปีการศึกษาและเทอมหลัก (Manage & Active Setting)",
        description: "เพิ่ม ลบ แก้ไข และกำหนดปีการศึกษา/ภาคเรียนหลักของสถานศึกษา",
        type: "edit",
      },
    ],
  },
  {
    id: "curriculum",
    title: "2. ระดับชั้น สาขาวิชา และห้องเรียน",
    description: "การกำหนดโครงสร้างห้องเรียนเป้าหมายสำหรับนักศึกษาและตัวกรอง",
    iconName: "Class",
    items: [
      {
        key: "curriculum.view",
        title: "ดูโครงสร้างชั้นเรียนและสาขา (Read Only)",
        description: "ดูรายการระดับชั้น ปวช./ปวส. สาขาวิชา รหัสย่อ และห้องเรียน",
        type: "read",
      },
      {
        key: "curriculum.manage",
        title: "จัดการระดับชั้น สาขา และห้อง (Add/Edit/Delete Master Data)",
        description: "เพิ่ม ลบ แก้ไข รหัสย่อสาขา ระดับชั้น และกลุ่มเรียน",
        type: "edit",
      },
    ],
  },
  {
    id: "student_dashboard",
    title: "3. ภาพรวมงานนักเรียนและนักศึกษา",
    description: "การเข้าถึงหน้าแดชบอร์ดภาพรวมผู้เรียนและตัวเลขสถิติ",
    iconName: "School",
    items: [
      {
        key: "student_dashboard.view",
        title: "เข้าดูหน้าภาพรวมงานนักเรียน (Dashboard View)",
        description: "เข้าถึงหน้า /dashboard/students และการ์ดเชื่อมโยง 4 โมดูล",
        type: "read",
      },
      {
        key: "student_dashboard.view_stats",
        title: "ดูตัวเลขสถิติและ KPI เชิงลึก (View Analytics & KPI)",
        description: "ดูสถิติอัตราคงอยู่ สัดส่วนผู้เรียน และร้อยละสมรรถนะ",
        type: "read",
      },
    ],
  },
  {
    id: "students",
    title: "4. ทะเบียนข้อมูลนักเรียนนักศึกษา",
    description: "การค้นหา ข้อมูลส่วนตัว นำเข้าแบบกลุ่ม และส่งออกข้อมูล",
    iconName: "Groups",
    items: [
      {
        key: "students.view",
        title: "ดูทะเบียนรายชื่อนักศึกษา (Read Only)",
        description: "ค้นหา ดูข้อมูลนักเรียน รหัส สาขา ห้อง และสถานะภาพ",
        type: "read",
      },
      {
        key: "students.edit",
        title: "เพิ่ม แก้ไข และลบข้อมูลนักเรียนรายคน (Edit/Delete)",
        description: "สิทธิ์เปิดฟอร์มเพิ่มข้อมูล แก้ไขข้อมูลส่วนตัว หรือลบนักเรียน",
        type: "edit",
      },
      {
        key: "students.import",
        title: "นำเข้าข้อมูลนักเรียนแบบกลุ่ม (Bulk Import CSV/Excel)",
        description: "สิทธิ์ใช้งาน Dual-Textarea และอัปโหลดไฟล์ Excel นำเข้านักเรียน",
        type: "edit",
      },
      {
        key: "students.export",
        title: "ส่งออกไฟล์รายชื่อนักศึกษา (Export CSV)",
        description: "สิทธิ์ดาวน์โหลดไฟล์ CSV พร้อม Thai BOM สำหรับ Excel",
        type: "read",
      },
    ],
  },
  {
    id: "quick_upload",
    title: "5. ทางลัดอัปโหลดด่วน (Quick Upload)",
    description: "การเข้าถึงระบบทางลัดอัปโหลดไฟล์หลักฐานพร้อมแยกหมวดหมู่อัตโนมัติ",
    iconName: "Bolt",
    items: [
      {
        key: "quick_upload.access",
        title: "เข้าใช้งานและอัปโหลดไฟล์ด่วน (Quick Upload Access)",
        description: "เข้าถึงหน้า /quick-upload และอัปโหลดไฟล์หลักฐานร่องรอย SAR",
        type: "edit",
      },
    ],
  },
  {
    id: "evidence",
    title: "6. คลังไฟล์และร่องรอยหลักฐาน (Evidence Stock)",
    description: "ขอบเขตการมองเห็นไฟล์หลักฐาน SAR และการจัดการไฟล์",
    iconName: "FolderSpecial",
    items: [
      {
        key: "evidence.view_own",
        title: "ดูไฟล์หลักฐานเฉพาะของตนเอง (View Own)",
        description: "มองเห็นและดาวน์โหลดเฉพาะไฟล์ที่ตนเองเป็นผู้อัปโหลด",
        type: "read",
      },
      {
        key: "evidence.view_all",
        title: "ดูไฟล์หลักฐานของทุกคนในระบบ (View All Stock)",
        description: "เปิดดูและดาวน์โหลดไฟล์หลักฐาน แผนการสอน ผลงาน ของครูทุกคนได้",
        type: "read",
      },
      {
        key: "evidence.upload",
        title: "อัปโหลดไฟล์หลักฐานเข้าระบบ (Upload Evidence)",
        description: "สิทธิ์อัปโหลดเอกสาร วุฒิบัตร ชิ้นงาน และรูปภาพเข้าคลัง",
        type: "edit",
      },
      {
        key: "evidence.delete",
        title: "ลบไฟล์หลักฐาน (Delete Evidence)",
        description: "สิทธิ์ในการลบไฟล์หลักฐานออกจากระบบหรือคลังไฟล์",
        type: "edit",
      },
    ],
  },
  {
    id: "attendance",
    title: "7. บันทึกการเข้าเรียนและพฤติกรรม",
    description: "ระบบเช็คชื่อเวลาเรียน มา/สาย/ขาด/ลา และคะแนนพฤติกรรมผู้เรียน",
    iconName: "FactCheck",
    items: [
      {
        key: "attendance.view",
        title: "ดูประวัติและสถิติเวลาเรียน (View Attendance)",
        description: "ดูสถิติการเข้าเรียน ร้อยละการมาเรียนของผู้เรียน",
        type: "read",
      },
      {
        key: "attendance.record",
        title: "บันทึกเวลาเรียนและพฤติกรรม (Record Attendance)",
        description: "สิทธิ์เปิดฟอร์มเช็คชื่อ บันทึกพฤติกรรมรายวัน/รายสัปดาห์",
        type: "edit",
      },
    ],
  },
  {
    id: "competencies",
    title: "8. ผลสัมฤทธิ์และสมรรถนะวิชาชีพ",
    description: "การประเมินสมรรถนะรายวิชา ชิ้นงานผู้เรียน และเกณฑ์มาตรฐาน SAR",
    iconName: "EmojiEvents",
    items: [
      {
        key: "competencies.view",
        title: "ดูผลสัมฤทธิ์และสมรรถนะ (View Competencies)",
        description: "ดูรายงานผลสัมฤทธิ์การประเมินสมรรถนะวิชาชีพของผู้เรียน",
        type: "read",
      },
      {
        key: "competencies.record",
        title: "บันทึกและประเมินสมรรถนะ (Record Competencies)",
        description: "สิทธิ์ให้คะแนน บันทึกผลการประเมินสมรรถนะ และแนบชิ้นงานผู้เรียน",
        type: "edit",
      },
    ],
  },
  {
    id: "activities",
    title: "9. กิจกรรมผู้เรียนและหน้าเสาธง",
    description: "การบันทึกกิจกรรมชมรม กิจกรรมจิตอาสา และการเข้าร่วมหน้าเสาธง",
    iconName: "Flag",
    items: [
      {
        key: "activities.view",
        title: "ดูกิจกรรมผู้เรียนและประวัติหน้าเสาธง (View Activities)",
        description: "ดูสถิติการเข้าร่วมกิจกรรมและหน้าเสาธงของผู้เรียน",
        type: "read",
      },
      {
        key: "activities.record",
        title: "บันทึกกิจกรรมและการเข้าแถว (Record Activities)",
        description: "สิทธิ์บันทึกการร่วมกิจกรรมชมรม กิจกรรมวิทยาลัย และหน้าเสาธง",
        type: "edit",
      },
    ],
  },
  {
    id: "teachers",
    title: "10. งานครูและบุคลากร",
    description: "โปรไฟล์ แผนการสอน การอบรมพัฒนา และงานวิจัย",
    iconName: "Person",
    items: [
      {
        key: "profile.view_all",
        title: "ดูโปรไฟล์บุคลากรท่านอื่นได้ (Read Other Profiles)",
        description: "สามารถเข้าดูประวัติ วุฒิการศึกษา ทักษะ ของบุคลากรทุกคนได้",
        type: "read",
      },
      {
        key: "profile.edit_all",
        title: "แก้ไขโปรไฟล์บุคลากรท่านอื่นได้ (Edit Other Profiles)",
        description: "สิทธิ์แก้ไขข้อมูลประวัติ วุฒิ และทักษะแทนบุคลากรท่านอื่น",
        type: "edit",
      },
      {
        key: "teachers.lesson_plans",
        title: "จัดการแผนการสอนและบันทึกหลังสอน (Lesson Plans)",
        description: "สิทธิ์บันทึกและแนบแผนการจัดการเรียนรู้",
        type: "edit",
      },
      {
        key: "teachers.trainings",
        title: "จัดการประวัติการอบรมและพัฒนาวิชาชีพ (Trainings)",
        description: "สิทธิ์บันทึกการอบรม สัมมนา และแนบวุฒิบัตร",
        type: "edit",
      },
      {
        key: "teachers.researches",
        title: "จัดการงานวิจัยและสิ่งประดิษฐ์ (Researches)",
        description: "สิทธิ์บันทึกงานวิจัยในชั้นเรียน และนวัตกรรมสิ่งประดิษฐ์",
        type: "edit",
      },
    ],
  },
  {
    id: "admin",
    title: "11. การบริหารระบบและสิทธิ์ (System Administration)",
    description: "การจัดการบัญชียูสเซอร์ สิทธิ์ และการตั้งค่าระบบ",
    iconName: "AdminPanelSettings",
    items: [
      {
        key: "admin.users",
        title: "จัดการบัญชีผู้ใช้งาน (Manage Users)",
        description: "สร้าง แก้ไข ระงับบัญชี และกำหนดรหัสผ่านให้ผู้ใช้",
        type: "admin",
      },
      {
        key: "admin.roles",
        title: "กำหนดยศและสิทธิ์การใช้งาน (Manage Roles & Matrix)",
        description: "สร้างยศ ปรับแต่ง Matrix สิทธิ์ Read vs Edit ทุกโมดูล",
        type: "admin",
      },
      {
        key: "admin.licenses",
        title: "จัดการประเภทใบอนุญาตวิชาชีพ (License Types Config)",
        description: "ตั้งค่าประเภทใบอนุญาต คุรุสภา TPQI DSD กว. และเกณฑ์อายุบัตร",
        type: "admin",
      },
      {
        key: "admin.department",
        title: "จัดการข้อมูลและบริบทแผนกวิชา (Department Profile)",
        description: "กำหนดวิสัยทัศน์ พันธกิจ ข้อมูลติดต่อ ห้องปฏิบัติการ และเป้าหมาย SAR",
        type: "admin",
      },
      {
        key: "admin.system",
        title: "ตั้งค่าระบบ มอนิเตอร์ และ Backup (System Admin)",
        description: "ดูมอนิเตอร์โหนด ระบบสำรองข้อมูล Snapshot และเซิร์ฟเวอร์",
        type: "admin",
      },
    ],
  },
];

// All permission keys as a flat list
export const ALL_PERMISSION_KEYS: string[] = PERMISSION_CATEGORIES.flatMap((c) =>
  c.items.map((i) => i.key)
);

/**
 * Role Presets Definition
 * แนะนำสิทธิ์ตามบทบาทงานในสถานศึกษา
 */
export interface RolePreset {
  code: string;
  title: string;
  description: string;
  color: string;
  permissions: string[];
}

export const ROLE_PRESETS: RolePreset[] = [
  {
    code: "ROOT",
    title: "ผู้ดูแลระบบสูงสุด (ROOT)",
    description: "มีสิทธิ์สูงสุดทุกฟังก์ชันในระบบ ทั้งอ่าน แก้ไข และตั้งค่าโครงสร้าง",
    color: "rose",
    permissions: [...ALL_PERMISSION_KEYS, "/dashboard", "/admin/users"],
  },
  {
    code: "EXECUTIVE",
    title: "ผู้บริหารสถานศึกษา (Executive)",
    description: "สิทธิ์อ่านและดูข้อมูลทั้งหมดทุกโมดูล (Read-Only) สำหรับการตรวจประเมินและติดตามงาน SAR",
    color: "purple",
    permissions: [
      "/dashboard",
      "academic_year.view",
      "curriculum.view",
      "student_dashboard.view",
      "student_dashboard.view_stats",
      "students.view",
      "students.export",
      "evidence.view_all",
      "attendance.view",
      "competencies.view",
      "activities.view",
      "profile.view_all",
    ],
  },
  {
    code: "DEPT_HEAD",
    title: "หัวหน้าแผนกวิชา (Department Head)",
    description: "ดูภาพรวมทั้งหมด จัดการข้อมูลนักศึกษา บันทึกเวลาเรียน สมรรถนะ กิจกรรม และอัปโหลดหลักฐาน SAR",
    color: "amber",
    permissions: [
      "/dashboard",
      "academic_year.view",
      "curriculum.view",
      "curriculum.manage",
      "student_dashboard.view",
      "student_dashboard.view_stats",
      "students.view",
      "students.edit",
      "students.import",
      "students.export",
      "quick_upload.access",
      "evidence.view_all",
      "evidence.upload",
      "attendance.view",
      "attendance.record",
      "competencies.view",
      "competencies.record",
      "activities.view",
      "activities.record",
      "profile.view_all",
      "teachers.lesson_plans",
      "teachers.trainings",
      "teachers.researches",
      "admin.department",
    ],
  },
  {
    code: "TEACHER",
    title: "ครูผู้สอน / ครูที่ปรึกษา (Teacher)",
    description: "ดูรายชื่อนักเรียน บันทึกการเข้าเรียน สมรรถนะ กิจกรรมผู้เรียน จัดการแผนการสอน และอัปโหลดหลักฐานของตนเอง",
    color: "blue",
    permissions: [
      "/dashboard",
      "academic_year.view",
      "curriculum.view",
      "student_dashboard.view",
      "students.view",
      "students.export",
      "quick_upload.access",
      "evidence.view_own",
      "evidence.upload",
      "attendance.view",
      "attendance.record",
      "competencies.view",
      "competencies.record",
      "activities.view",
      "activities.record",
      "teachers.lesson_plans",
      "teachers.trainings",
      "teachers.researches",
    ],
  },
  {
    code: "REGISTRAR",
    title: "เจ้าหน้าที่งานทะเบียน (Registrar)",
    description: "สิทธิ์เต็มด้านทะเบียนนักเรียนนักศึกษา นำเข้าข้อมูลแบบกลุ่ม จัดการห้องเรียนเป้าหมาย และส่งออกข้อมูล",
    color: "teal",
    permissions: [
      "/dashboard",
      "academic_year.view",
      "academic_year.manage",
      "curriculum.view",
      "curriculum.manage",
      "student_dashboard.view",
      "student_dashboard.view_stats",
      "students.view",
      "students.edit",
      "students.import",
      "students.export",
    ],
  },
  {
    code: "QA_OFFICER",
    title: "เจ้าหน้าที่งานประกันคุณภาพ (QA Officer)",
    description: "ดูข้อมูลภาพรวม SAR คลังหลักฐานทั้งหมดของวิทยาลัย ตัวเลขสถิติ และรายงานประเมินตนเอง",
    color: "emerald",
    permissions: [
      "/dashboard",
      "academic_year.view",
      "curriculum.view",
      "student_dashboard.view",
      "student_dashboard.view_stats",
      "students.view",
      "students.export",
      "evidence.view_all",
      "evidence.upload",
      "attendance.view",
      "competencies.view",
      "activities.view",
      "profile.view_all",
    ],
  },
];
