import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

const STAFF_ROLES: Role[] = [
  "SUPER_ADMIN",
  "PRINCIPAL",
  "ACADEMIC_HEAD",
  "TEACHER",
  "ACCOUNTANT",
  "ADMISSIONS",
  "LIBRARIAN",
  "NURSE",
  "HR",
  "TRANSPORT",
];

export async function getRelevantAnnouncements(userId: string, role: Role) {
  const audiences: ("ALL" | "STAFF" | "PARENTS" | "TEACHERS")[] = ["ALL"];
  if (STAFF_ROLES.includes(role)) audiences.push("STAFF");
  if (role === "PARENT") audiences.push("PARENTS");
  if (role === "TEACHER") audiences.push("TEACHERS");

  let classIds: string[] = [];
  if (role === "TEACHER") {
    const teacher = await prisma.teacher.findUnique({
      where: { userId },
      include: { timetableSlots: { select: { classId: true }, distinct: ["classId"] } },
    });
    classIds = teacher?.timetableSlots.map((s) => s.classId) ?? [];
  }

  return prisma.announcement.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { audience: { in: audiences } },
        ...(classIds.length > 0 ? [{ audience: "CLASS" as const, classId: { in: classIds } }] : []),
      ],
    },
    include: { author: true },
    orderBy: { publishDate: "desc" },
    take: 10,
  });
}
