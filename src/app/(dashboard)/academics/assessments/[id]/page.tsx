import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ScoreSheet } from "@/components/academics/ScoreSheet";

export default async function AssessmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: { class: true, subject: true, scores: true },
  });
  if (!assessment) notFound();

  const enrollments = await prisma.enrollment.findMany({
    where: { classId: assessment.classId, academicYearId: assessment.academicYearId },
    include: { student: true },
    orderBy: { student: { lastName: "asc" } },
  });

  const students = enrollments.map((e) => ({
    id: e.student.id,
    name: `${e.student.firstName} ${e.student.lastName}`,
    admissionNumber: e.student.admissionNumber,
  }));
  const initialScores = Object.fromEntries(assessment.scores.map((s) => [s.studentId, s.score]));

  return (
    <div className="space-y-4 max-w-2xl">
      <Link href="/academics/assessments" className="text-sm text-sky-700 hover:underline">
        ← Back to Gradebook
      </Link>

      <div>
        <h1 className="text-xl font-bold text-slate-900">{assessment.name}</h1>
        <p className="text-sm text-slate-500">
          {assessment.class.name} · {assessment.subject.name} · {assessment.termName} · Weight{" "}
          {assessment.weight}%
        </p>
      </div>

      <ScoreSheet
        assessmentId={assessment.id}
        maxScore={assessment.maxScore}
        students={students}
        initialScores={initialScores}
      />
    </div>
  );
}
