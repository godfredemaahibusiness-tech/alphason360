"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notifyUser } from "@/lib/notifications";
import { revalidatePath } from "next/cache";
import type { LeaveType } from "@prisma/client";

export async function requestLeaveAction(formData: FormData) {
  const session = await auth();
  if (!session) return { error: "Not signed in." };

  const type = formData.get("type") as LeaveType;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const reason = (formData.get("reason") as string) || null;

  if (!type || !startDate || !endDate) {
    return { error: "Please fill in the leave type and dates." };
  }
  if (new Date(endDate) < new Date(startDate)) {
    return { error: "End date must be on or after the start date." };
  }

  await prisma.leaveRequest.create({
    data: {
      userId: session.user.id,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
    },
  });

  revalidatePath("/staff/leave");
  return { error: null };
}

export async function reviewLeaveAction(id: string, status: "APPROVED" | "REJECTED") {
  const session = await auth();
  if (!session) return;

  const leave = await prisma.leaveRequest.update({
    where: { id },
    data: { status, reviewedById: session.user.id },
  });

  await notifyUser(leave.userId, {
    type: "SYSTEM",
    title: `Your leave request was ${status.toLowerCase()}`,
    body: `${leave.type} leave from ${leave.startDate.toLocaleDateString("en-GB")} to ${leave.endDate.toLocaleDateString("en-GB")}`,
    link: "/staff/leave",
  });

  revalidatePath("/staff/leave");
}
