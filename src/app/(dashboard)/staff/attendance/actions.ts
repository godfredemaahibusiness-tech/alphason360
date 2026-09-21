"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export async function clockInAction() {
  const session = await auth();
  if (!session) return;
  const date = startOfDay(new Date());

  await prisma.staffAttendance.upsert({
    where: { userId_date: { userId: session.user.id, date } },
    create: { userId: session.user.id, date, status: "PRESENT", clockIn: new Date() },
    update: { clockIn: new Date(), status: "PRESENT" },
  });

  revalidatePath("/staff/attendance");
}

export async function clockOutAction() {
  const session = await auth();
  if (!session) return;
  const date = startOfDay(new Date());

  await prisma.staffAttendance.updateMany({
    where: { userId: session.user.id, date },
    data: { clockOut: new Date() },
  });

  revalidatePath("/staff/attendance");
}
