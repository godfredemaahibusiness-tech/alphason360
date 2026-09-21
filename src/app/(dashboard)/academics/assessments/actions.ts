"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveScoresAction(
  assessmentId: string,
  entries: { studentId: string; score: number }[]
) {
  await prisma.$transaction(
    entries.map((e) =>
      prisma.score.upsert({
        where: { assessmentId_studentId: { assessmentId, studentId: e.studentId } },
        create: { assessmentId, studentId: e.studentId, score: e.score },
        update: { score: e.score },
      })
    )
  );

  revalidatePath(`/academics/assessments/${assessmentId}`);
  revalidatePath("/academics/assessments");
  return { saved: entries.length };
}
