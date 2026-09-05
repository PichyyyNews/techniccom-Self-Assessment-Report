/**
 * Thai Name Parser — ดัดแปลงจาก activity_attendance_System
 * แยกชื่อเต็มภาษาไทย (รวมคำนำหน้า) → prefix, firstName, lastName
 *
 * รองรับคำนำหน้า: นาย, นางสาว, นาง, เด็กชาย, เด็กหญิง, ด.ช., ด.ญ., น.ส.
 * Normalize: ด.ช. / เด็กชาย → นาย, ด.ญ. / น.ส. / เด็กหญิง / นาง → นางสาว
 */

export interface ParsedThaiName {
  prefix: string;
  firstName: string;
  lastName: string;
}

// Thai prefixes ordered longest-first to prevent partial matches
const THAI_PREFIXES = [
  { pattern: "เด็กชาย", normalized: "นาย" },
  { pattern: "เด็กหญิง", normalized: "นางสาว" },
  { pattern: "นางสาว", normalized: "นางสาว" },
  { pattern: "นาง", normalized: "นางสาว" },
  { pattern: "นาย", normalized: "นาย" },
  { pattern: "น.ส.", normalized: "นางสาว" },
  { pattern: "ด.ช.", normalized: "นาย" },
  { pattern: "ด.ญ.", normalized: "นางสาว" },
];

/**
 * Parse a single Thai full name string into prefix, firstName, lastName
 * @example parseThaiName("นายสมชาย ใจมั่น") → { prefix: "นาย", firstName: "สมชาย", lastName: "ใจมั่น" }
 * @example parseThaiName("น.ส.วิภาดา แก้วเกิด") → { prefix: "นางสาว", firstName: "วิภาดา", lastName: "แก้วเกิด" }
 */
export function parseThaiName(fullName: string): ParsedThaiName {
  const trimmed = fullName.trim();

  let prefix = "";
  let remaining = trimmed;

  for (const { pattern, normalized } of THAI_PREFIXES) {
    if (trimmed.startsWith(pattern)) {
      prefix = normalized;
      remaining = trimmed.slice(pattern.length).trim();
      break;
    }
  }

  // Split remaining by whitespace: first token = firstName, rest = lastName
  const parts = remaining.split(/\s+/).filter(Boolean);

  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ") || "";

  return { prefix, firstName, lastName };
}

/**
 * Parse multiple lines of names in bulk
 * @param namesText - Multi-line string, one name per line
 * @returns Array of parsed names
 */
export function parseThaiNamesBulk(namesText: string): ParsedThaiName[] {
  return namesText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map(parseThaiName);
}

/**
 * Count non-empty lines in a multi-line string
 */
export function countLines(text: string): number {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean).length;
}

/**
 * Split multi-line text into non-empty trimmed lines
 */
export function splitLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
