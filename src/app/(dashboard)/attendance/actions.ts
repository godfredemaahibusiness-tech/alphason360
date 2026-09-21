"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { AttendanceStatus } from "@prisma/client";

export async function saveAttendanceAction(
  dateIso: string,
  entries: { studentId: string; status: AttendanceStatus }[]
) {
  const date = new Date(dateIso);
  date.setHours(0, 0, 0, 0);

  await prisma.$transaction(
    entries.map((e) =>
      prisma.attendance.upsert({
        where: { studentId_date: { studentId: e.studentId, date } },
        create: { studentId: e.studentId, date, status: e.status },
        update: { status: e.status },
      })
    )
  );

  revalidatePath("/attendance");
  revalidatePath("/");
  return { saved: entries.length };
}
