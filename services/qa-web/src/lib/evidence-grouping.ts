import { EvidenceFileDetails } from "@/components/evidence/FileDetailsDialog";

export interface GalleryItem {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  metadata?: any;
  createdAt?: string;
}

export interface GroupedEvidenceFile extends EvidenceFileDetails {
  gallery?: GalleryItem[];
}

/**
 * Extracts base title by removing multi-file pattern e.g.
 * "ChatGPT Image Sep 1, 2026, 02_33_21 AM (1/2 - file.png)" -> "ChatGPT Image Sep 1, 2026, 02_33_21 AM"
 */
export function extractBaseTitle(title: string): string {
  if (!title) return "";
  // Match patterns like " (1/3 - filename)" or " (1/3)" or " (Part 1/2)"
  const cleaned = title.replace(/\s*\(\s*\d+\s*\/\s*\d+(\s*-\s*[^)]+)?\s*\)\s*$/i, "").trim();
  return cleaned || title;
}

/**
 * Groups related evidence files (e.g. from the same batch or multi-file upload)
 * into a single unified Evidence item with a `gallery` array for carousel display.
 */
export function groupEvidenceFiles(files: EvidenceFileDetails[]): GroupedEvidenceFile[] {
  if (!files || files.length === 0) return [];

  const groupMap = new Map<string, GroupedEvidenceFile>();
  const orderList: string[] = [];

  for (const file of files) {
    const meta = file.metadata || {};
    const batchId = meta.batchId;
    const baseTitle = extractBaseTitle(file.title);
    
    const uId = file.userId || file.user?.id || "user";
    
    // Generate a grouping key:
    // 1. If explicit batchId exists, use it
    // 2. Otherwise group by userId + category + academicYear + semester + baseTitle (if created within 10 min)
    let groupKey: string;
    if (batchId) {
      groupKey = `batch_${uId}_${batchId}`;
    } else {
      // Group by date bucket (within 10 minutes)
      const createdTime = new Date(file.createdAt).getTime();
      const timeBucket = Math.floor(createdTime / (10 * 60 * 1000));
      groupKey = `auto_${uId}_${file.category}_${file.academicYear}_${file.semester}_${baseTitle}_${timeBucket}`;
    }

    const galleryItem: GalleryItem = {
      id: file.id,
      title: file.title,
      fileName: file.fileName,
      fileUrl: file.fileUrl,
      fileType: file.fileType,
      fileSize: file.fileSize,
      metadata: file.metadata,
      createdAt: file.createdAt,
    };

    if (!groupMap.has(groupKey)) {
      orderList.push(groupKey);
      groupMap.set(groupKey, {
        ...file,
        title: baseTitle,
        gallery: [galleryItem],
      });
    } else {
      const existing = groupMap.get(groupKey)!;
      // Add to gallery if not already present
      if (!existing.gallery?.some((g) => g.id === file.id)) {
        existing.gallery = [...(existing.gallery || []), galleryItem];
      }
    }
  }

  return orderList.map((key) => groupMap.get(key)!);
}
