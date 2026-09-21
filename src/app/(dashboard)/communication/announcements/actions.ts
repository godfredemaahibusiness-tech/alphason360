"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notifyAudience } from "@/lib/notifications";
import { draftAnnouncement } from "@/lib/ai";
import { revalidatePath } from "next/cache";
import type { Audience } from "@prisma/client";

export async function draftAnnouncementAction(topic: string) {
  if (!topic.trim()) return { error: "Describe what the announcement should be about." };
  return draftAnnouncement(topic);
}

export async function createAnnouncementAction(formData: FormData) {
  const session = await auth();
  if (!session) return { error: "Not signed in." };

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const audience = formData.get("audience") as Audience;
  const classId = (formData.get("classId") as string) || null;
  const publishNow = formData.get("publishNow") === "on";

  if (!title || !description || !audience) {
    return { error: "Please fill in the title, description, and audience." };
  }
  if (audience === "CLASS" && !classId) {
    return { error: "Select a class for a class-targeted announcement." };
  }

  const announcement = await prisma.announcement.create({
    data: {
      title,
      description,
      audience,
      classId: audience === "CLASS" ? classId : null,
      status: publishNow ? "PUBLISHED" : "DRAFT",
      authorId: session.user.id,
    },
  });

  if (publishNow) {
    await notifyAudience(audience, classId, {
      type: "ANNOUNCEMENT",
      title: `New announcement: ${title}`,
      body: description,
      link: `/communication/announcements/${announcement.id}`,
    });
  }

  revalidatePath("/communication/announcements");
  return { error: null };
}

export async function setAnnouncementStatusAction(
  id: string,
  status: "PUBLISHED" | "ARCHIVED" | "DRAFT"
) {
  const announcement = await prisma.announcement.update({ where: { id }, data: { status } });

  if (status === "PUBLISHED") {
    await notifyAudience(announcement.audience, announcement.classId, {
      type: "ANNOUNCEMENT",
      title: `New announcement: ${announcement.title}`,
      body: announcement.description,
      link: `/communication/announcements/${announcement.id}`,
    });
  }

  revalidatePath("/communication/announcements");
  revalidatePath(`/communication/announcements/${id}`);
}
