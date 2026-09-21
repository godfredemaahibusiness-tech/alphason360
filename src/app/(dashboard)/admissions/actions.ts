"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { AdmissionStage } from "@prisma/client";

export async function createApplicantAction(formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const desiredClassId = (formData.get("desiredClassId") as string) || null;
  const parentName = formData.get("parentName") as string;
  const parentPhone = formData.get("parentPhone") as string;
  const parentEmail = (formData.get("parentEmail") as string) || null;
  const source = (formData.get("source") as string) || null;

  if (!firstName || !lastName || !parentName || !parentPhone) {
    return { error: "Please fill in the child's name and a parent contact." };
  }

  const currentYear = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
  if (!currentYear) return { error: "No current academic year is configured." };

  await prisma.applicant.create({
    data: {
      firstName,
      lastName,
      desiredClassId,
      parentName,
      parentPhone,
      parentEmail,
      source,
      academicYearId: currentYear.id,
    },
  });

  revalidatePath("/admissions");
  return { error: null };
}

export async function advanceStageAction(id: string, stage: AdmissionStage) {
  await prisma.applicant.update({ where: { id }, data: { stage } });
  revalidatePath("/admissions");
  revalidatePath(`/admissions/${id}`);
}

export async function updateNotesAction(id: string, notes: string) {
  await prisma.applicant.update({ where: { id }, data: { notes } });
  revalidatePath(`/admissions/${id}`);
}

export async function enrollApplicantAction(id: string) {
  const applicant = await prisma.applicant.findUnique({ where: { id } });
  if (!applicant) return { error: "Applicant not found." };
  if (applicant.enrolledStudentId) return { error: "Already enrolled." };

  const admissionCount = await prisma.student.count();
  const admissionNumber = `AIS-${String(admissionCount + 1).padStart(4, "0")}`;

  const classId =
    applicant.desiredClassId ?? (await prisma.schoolClass.findFirst({ orderBy: { order: "asc" } }))?.id;
  if (!classId) return { error: "No class available to enroll into." };

  const student = await prisma.student.create({
    data: {
      admissionNumber,
      firstName: applicant.firstName,
      lastName: applicant.lastName,
      gender: "MALE", // not captured at inquiry stage; editable later from the student profile
      dateOfBirth: new Date(new Date().getFullYear() - 6, 0, 1),
      status: "ACTIVE",
    },
  });

  const guardian = await prisma.guardian.create({
    data: {
      name: applicant.parentName,
      relationship: "Parent",
      phone: applicant.parentPhone,
      email: applicant.parentEmail,
    },
  });

  await prisma.studentGuardian.create({
    data: { studentId: student.id, guardianId: guardian.id, isPrimary: true },
  });

  await prisma.enrollment.create({
    data: { studentId: student.id, classId, academicYearId: applicant.academicYearId },
  });

  await prisma.applicant.update({
    where: { id },
    data: { stage: "ENROLLED", enrolledStudentId: student.id },
  });

  await prisma.activityLog.create({
    data: {
      message: `${applicant.firstName} ${applicant.lastName} enrolled as ${admissionNumber}`,
      actorName: "Admissions Office",
    },
  });

  revalidatePath("/admissions");
  revalidatePath(`/admissions/${id}`);
  revalidatePath("/students");
  revalidatePath("/");
  return { error: null, studentId: student.id };
}
