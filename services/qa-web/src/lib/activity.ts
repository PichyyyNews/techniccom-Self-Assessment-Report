import { prisma } from "@/lib/prisma";

export async function logActivity(
  userId: string,
  action: string,
  title: string,
  metadata?: any
) {
  try {
    return await prisma.activityLog.create({
      data: {
        userId,
        action,
        title,
        metadata: metadata ? metadata : undefined,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
    return null;
  }
}
