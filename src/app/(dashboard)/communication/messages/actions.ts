"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notifyUser } from "@/lib/notifications";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function sendMessageAction(formData: FormData) {
  const session = await auth();
  if (!session) return { error: "Not signed in." };

  const recipientId = formData.get("recipientId") as string;
  const subject = formData.get("subject") as string;
  const body = formData.get("body") as string;

  if (!recipientId || !subject || !body) {
    return { error: "Please select a recipient and fill in subject and message." };
  }

  const message = await prisma.message.create({
    data: { senderId: session.user.id, recipientId, subject, body },
  });

  await notifyUser(recipientId, {
    type: "MESSAGE",
    title: `New message from ${session.user.name}`,
    body: subject,
    link: `/communication/messages/${message.id}`,
  });

  revalidatePath("/communication/messages");
  redirect(`/communication/messages/${message.id}`);
}

export async function markMessageReadAction(messageId: string) {
  const session = await auth();
  if (!session) return;

  await prisma.message.updateMany({
    where: { id: messageId, recipientId: session.user.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/communication/messages");
}
