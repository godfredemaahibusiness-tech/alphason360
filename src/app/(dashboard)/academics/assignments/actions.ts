"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createAssignmentAction(formData: FormData) {
  const title = formData.get("title") as string;
  const instructions = formData.get("instructions") as string;
  const classId = formData.get("classId") as string;
  const subjectId = formData.get("subjectId") as string;
  const dueDate = formData.get("dueDate") as string;

  if (!title || !classId || !subjectId || !dueDate) {
    return { error: "Please fill in all required fields." };
  }

  await prisma.assignment.create({
    data: { title, instructions, classId, subjectId, dueDate: new Date(dueDate) },
  });

  revalidatePath("/academics/assignments");
  return { error: null };
}
