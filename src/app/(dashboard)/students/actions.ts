"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { Gender } from "@prisma/client";

export async function createStudentAction(formData: FormData) {
  const firstName = (formData.get("firstName") as string)?.trim();
  const lastName = (formData.get("lastName") as string)?.trim();
  const gender = formData.get("gender") as Gender;
  const dateOfBirth = formData.get("dateOfBirth") as string;
  const classId = formData.get("classId") as string;
  const guardianName = (formData.get("guardianName") as string)?.trim();
  const guardianRelationship = (formData.get("guardianRelationship") as string) || "Parent";
  const guardianPhone = (formData.get("guardianPhone") as string)?.trim();
  const guardianEmail = (formData.get("guardianEmail") as string)?.trim() || null;

  if (!firstName || !lastName || !gender || !dateOfBirth || !classId) {
    return { error: "Please fill in the student's name, gender, date of birth, and class." };
  }
  if (!guardianName || !guardianPhone) {
    return { error: "Please provide a guardian name and phone number." };
  }

  const currentYear = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
  if (!currentYear) return { error: "No current academic year is configured." };

  const admissionCount = await prisma.student.count();
  const admissionNumber = `AIS-${String(admissionCount + 1).padStart(4, "0")}`;

  const student = await prisma.student.create({
    data: {
      admissionNumber,
      firstName,
      lastName,
      gender,
      dateOfBirth: new Date(dateOfBirth),
      status: "ACTIVE",
    },
  });

  const guardian = await prisma.guardian.create({
    data: {
      name: guardianName,
      relationship: guardianRelationship,
      phone: guardianPhone,
      email: guardianEmail,
    },
  });

  await prisma.studentGuardian.create({
    data: { studentId: student.id, guardianId: guardian.id, isPrimary: true },
  });

  await prisma.enrollment.create({
    data: { studentId: student.id, classId, academicYearId: currentYear.id },
  });

  await prisma.activityLog.create({
    data: {
      message: `${firstName} ${lastName} admitted as ${admissionNumber}`,
      actorName: "Admin Office",
    },
  });

  revalidatePath("/students");
  revalidatePath("/");
  return { error: null, studentId: student.id };
}
