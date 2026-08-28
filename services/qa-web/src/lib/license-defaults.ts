import { prisma } from "./prisma";

export interface DefaultLicenseConfigItem {
  code: string;
  title: string;
  description: string;
  category: string;
  categoryLabel: string;
  defaultYears: number;
  issuer: string;
  color: string;
  icon: string;
  requiresProvisionalRound: boolean;
  requiresTitle: boolean;
  titleLabel?: string;
  titlePlaceholder?: string;
  presetChips: string[];
  sortOrder: number;
  isActive: boolean;
  isSystem: boolean;
}

export const DEFAULT_LICENSE_CONFIGS: DefaultLicenseConfigItem[] = [
  {
    code: "KSP_B_LICENSE",
    title: "B-License (ชั้นต้น)",
    description: "ใบอนุญาตประกอบวิชาชีพครูชั้นต้น (อายุ 5 ปี)",
    category: "ksp",
    categoryLabel: "ใบอนุญาตคุรุสภา / ผ่อนผัน (KSP)",
    defaultYears: 5,
    issuer: "สำนักงานเลขาธิการคุรุสภา",
    color: "teal",
    icon: "GraduationCap",
    requiresProvisionalRound: false,
    requiresTitle: false,
    presetChips: [],
    sortOrder: 1,
    isActive: true,
    isSystem: true,
  },
  {
    code: "KSP_A_LICENSE",
    title: "A-License (ชั้นสูง)",
    description: "ใบอนุญาตประกอบวิชาชีพครูชั้นสูง (อายุ 7 ปี)",
    category: "ksp",
    categoryLabel: "ใบอนุญาตคุรุสภา / ผ่อนผัน (KSP)",
    defaultYears: 7,
    issuer: "สำนักงานเลขาธิการคุรุสภา",
    color: "purple",
    icon: "Award",
    requiresProvisionalRound: false,
    requiresTitle: false,
    presetChips: [],
    sortOrder: 2,
    isActive: true,
    isSystem: true,
  },
  {
    code: "KSP_P_LICENSE",
    title: "P-License (ปฏิบัติหน้าที่ครู)",
    description: "ใบอนุญาตปฏิบัติหน้าที่ครู (อายุ 2 ปี)",
    category: "ksp",
    categoryLabel: "ใบอนุญาตคุรุสภา / ผ่อนผัน (KSP)",
    defaultYears: 2,
    issuer: "สำนักงานเลขาธิการคุรุสภา",
    color: "blue",
    icon: "Shield",
    requiresProvisionalRound: false,
    requiresTitle: false,
    presetChips: [],
    sortOrder: 3,
    isActive: true,
    isSystem: true,
  },
  {
    code: "KSP_PROVISIONAL",
    title: "หนังสือผ่อนผันคุรุสภา (สอศ.)",
    description: "สำหรับครูพิเศษสอนสายช่าง/คอมพิวเตอร์ (คราวละ 2 ปี)",
    category: "ksp",
    categoryLabel: "ใบอนุญาตคุรุสภา / ผ่อนผัน (KSP)",
    defaultYears: 2,
    issuer: "สำนักงานเลขาธิการคุรุสภา / สอศ.",
    color: "amber",
    icon: "Clock",
    requiresProvisionalRound: true,
    requiresTitle: false,
    presetChips: [],
    sortOrder: 4,
    isActive: true,
    isSystem: true,
  },
  {
    code: "TPQI_CERTIFICATE",
    title: "คุณวุฒิวิชาชีพ (TPQI)",
    description: "สถาบันคุณวุฒิวิชาชีพ เช่น สาขา IT / ซอฟต์แวร์",
    category: "vocational",
    categoryLabel: "คุณวุฒิวิชาชีพ / มาตรฐานฝีมือ (TPQI/DSD/กว.)",
    defaultYears: 3,
    issuer: "สถาบันคุณวุฒิวิชาชีพ (องค์การมหาชน)",
    color: "emerald",
    icon: "FileBadge",
    requiresProvisionalRound: false,
    requiresTitle: true,
    titleLabel: "ระบุสาขาวิชาชีพ / ระดับมาตรฐาน",
    titlePlaceholder: "เช่น สาขาเทคโนโลยีสารสนเทศและการสื่อสาร ระดับ 4",
    presetChips: [
      "สาขาวิชาชีพ IT และดิจิทัลคอนเทนต์ ระดับ 4",
      "นักพัฒนาระบบ (Software Developer) ระดับ 4",
      "ผู้ดูแลระบบเครือข่าย (Network Admin) ระดับ 4",
      "ความมั่นคงปลอดภัยไซเบอร์ (Cybersecurity) ระดับ 4",
    ],
    sortOrder: 5,
    isActive: true,
    isSystem: true,
  },
  {
    code: "DSD_STANDARD",
    title: "มาตรฐานฝีมือแรงงาน (DSD)",
    description: "กรมพัฒนาฝีมือแรงงาน เช่น ช่างซ่อมคอมพิวเตอร์ / ช่างไฟฟ้า",
    category: "vocational",
    categoryLabel: "คุณวุฒิวิชาชีพ / มาตรฐานฝีมือ (TPQI/DSD/กว.)",
    defaultYears: 5,
    issuer: "กรมพัฒนาฝีมือแรงงาน กระทรวงแรงงาน",
    color: "indigo",
    icon: "Award",
    requiresProvisionalRound: false,
    requiresTitle: true,
    titleLabel: "ระบุสาขาช่าง / ระดับฝีมือแรงงาน",
    titlePlaceholder: "เช่น ช่างซ่อมไมโครคอมพิวเตอร์ ระดับ 2",
    presetChips: [
      "ช่างซ่อมไมโครคอมพิวเตอร์ ระดับ 1",
      "ช่างซ่อมไมโครคอมพิวเตอร์ ระดับ 2",
      "ช่างติดตั้งและบำรุงรักษาระบบเครือข่าย ระดับ 2",
      "ช่างเขียนแบบคอมพิวเตอร์ ระดับ 1",
    ],
    sortOrder: 6,
    isActive: true,
    isSystem: true,
  },
  {
    code: "COE_ENGINEER",
    title: "ใบประกอบวิชาชีพวิศวกรรม (กว.)",
    description: "สภาวิศวกร เช่น วิศวกรรมคอมพิวเตอร์ / ไฟฟ้า",
    category: "vocational",
    categoryLabel: "คุณวุฒิวิชาชีพ / มาตรฐานฝีมือ (TPQI/DSD/กว.)",
    defaultYears: 5,
    issuer: "สภาวิศวกร (Council of Engineers)",
    color: "rose",
    icon: "Briefcase",
    requiresProvisionalRound: false,
    requiresTitle: true,
    titleLabel: "ระบุสาขาวิศวกรรมควบคุม",
    titlePlaceholder: "เช่น วิศวกรรมคอมพิวเตอร์ หรือ วิศวกรรมไฟฟ้าสื่อสาร",
    presetChips: [
      "วิศวกรรมคอมพิวเตอร์ (กว.)",
      "วิศวกรรมไฟฟ้าสื่อสาร (กว.)",
      "วิศวกรรมไฟฟ้ากำลัง (กว.)",
    ],
    sortOrder: 7,
    isActive: true,
    isSystem: true,
  },
  {
    code: "OTHER_PROFESSIONAL",
    title: "ใบรับรองมาตรฐานสากล / อื่นๆ",
    description: "เช่น Cisco CCNA, CompTIA, Microsoft Certified",
    category: "vocational",
    categoryLabel: "คุณวุฒิวิชาชีพ / มาตรฐานฝีมือ (TPQI/DSD/กว.)",
    defaultYears: 3,
    issuer: "สถาบัน/องค์กรมาตรฐานวิชาชีพ",
    color: "slate",
    icon: "Sparkles",
    requiresProvisionalRound: false,
    requiresTitle: true,
    titleLabel: "ระบุชื่อใบรับรอง / สถาบันผู้ออก",
    titlePlaceholder: "เช่น Cisco Certified Network Associate (CCNA)",
    presetChips: [
      "Cisco Certified Network Associate (CCNA)",
      "CompTIA Security+",
      "CompTIA Network+",
      "Microsoft Certified: Azure Fundamentals",
      "Google Cloud Certified Professional",
    ],
    sortOrder: 8,
    isActive: true,
    isSystem: true,
  },
];

export interface DefaultLicenseCategoryItem {
  code: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
  isSystem: boolean;
}

export const DEFAULT_LICENSE_CATEGORIES: DefaultLicenseCategoryItem[] = [
  {
    code: "ksp",
    title: "ใบอนุญาตคุรุสภา / ผ่อนผัน (KSP)",
    description: "มาตรฐานวิชาชีพครูและหนังสือผ่อนผันคุรุสภาสำหรับครูพิเศษสอน",
    icon: "GraduationCap",
    color: "teal",
    sortOrder: 1,
    isActive: true,
    isSystem: true,
  },
  {
    code: "vocational",
    title: "คุณวุฒิวิชาชีพ / มาตรฐานฝีมือ (TPQI/DSD/กว.)",
    description: "คุณวุฒิวิชาชีพและมาตรฐานฝีมือแรงงานเฉพาะทางสายช่างและเทคโนโลยี",
    icon: "Award",
    color: "emerald",
    sortOrder: 2,
    isActive: true,
    isSystem: true,
  },
  {
    code: "other",
    title: "ใบรับรองมาตรฐานสากลและอื่นๆ",
    description: "ใบรับรองมาตรฐานสากล Certifications เฉพาะทาง",
    icon: "Sparkles",
    color: "blue",
    sortOrder: 3,
    isActive: true,
    isSystem: false,
  },
];

export async function ensureDefaultLicenseConfigs() {
  try {
    // Seed Categories
    const categoryCount = await prisma.licenseCategoryConfig.count();
    if (categoryCount === 0) {
      for (const cat of DEFAULT_LICENSE_CATEGORIES) {
        await prisma.licenseCategoryConfig.upsert({
          where: { code: cat.code },
          create: cat,
          update: {},
        });
      }
    }

    // Seed License Types
    const count = await prisma.licenseTypeConfig.count();
    if (count === 0) {
      for (const item of DEFAULT_LICENSE_CONFIGS) {
        await prisma.licenseTypeConfig.upsert({
          where: { code: item.code },
          create: item,
          update: {},
        });
      }
    }
  } catch (error) {
    console.error("Error seeding default license configs:", error);
  }
}
