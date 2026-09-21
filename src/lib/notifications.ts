import { prisma } from "@/lib/prisma";
import type { Audience, NotificationType } from "@prisma/client";

const STAFF_ROLES = [
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
] as const;

export async function usersForAudience(audience: Audience, classId?: string | null) {
  switch (audience) {
    case "ALL":
      return prisma.user.findMany({ select: { id: true } });
    case "STAFF":
      return prisma.user.findMany({ where: { role: { in: [...STAFF_ROLES] } }, select: { id: true } });
    case "PARENTS":
      return prisma.user.findMany({ where: { role: "PARENT" }, select: { id: true } });
    case "TEACHERS":
      return prisma.user.findMany({ where: { role: "TEACHER" }, select: { id: true } });
    case "CLASS": {
      if (!classId) return [];
      const slots = await prisma.timetableSlot.findMany({
        where: { classId },
        select: { teacher: { select: { userId: true } } },
        distinct: ["teacherId"],
      });
      const teacherUserIds = slots.map((s) => s.teacher.userId);
      const admins = await prisma.user.findMany({
        where: { role: { in: ["SUPER_ADMIN", "PRINCIPAL"] } },
        select: { id: true },
      });
      const ids = new Set([...teacherUserIds, ...admins.map((a) => a.id)]);
      return Array.from(ids).map((id) => ({ id }));
    }
    default:
      return [];
  }
}

export async function notifyAudience(
  audience: Audience,
  classId: string | null | undefined,
  data: { type: NotificationType; title: string; body?: string; link?: string }
) {
  const users = await usersForAudience(audience, classId);
  if (users.length === 0) return;
  await prisma.notification.createMany({
    data: users.map((u) => ({ userId: u.id, ...data })),
  });
}

export async function notifyUser(
  userId: string,
  data: { type: NotificationType; title: string; body?: string; link?: string }
) {
  await prisma.notification.create({ data: { userId, ...data } });
}
