import { prisma } from "@/lib/prisma";

export async function getReportCard(studentId: string, termName: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      enrollments: { include: { class: true, section: true, academicYear: true }, take: 1 },
    },
  });
  if (!student) return null;

  const enrollment = student.enrollments[0];
  if (!enrollment) return null;

  const assessments = await prisma.assessment.findMany({
    where: { classId: enrollment.classId, termName, academicYearId: enrollment.academicYearId },
    include: { subject: true, scores: { where: { studentId } } },
  });

  const bySubject = new Map<
    string,
    { subjectName: string; weightedTotal: number; weightCovered: number; breakdown: { type: string; score: number; maxScore: number; weight: number }[] }
  >();

  for (const a of assessments) {
    const score = a.scores[0];
    if (!score) continue;
    const key = a.subjectId;
    if (!bySubject.has(key)) {
      bySubject.set(key, { subjectName: a.subject.name, weightedTotal: 0, weightCovered: 0, breakdown: [] });
    }
    const entry = bySubject.get(key)!;
    const pct = (score.score / a.maxScore) * 100;
    entry.weightedTotal += (pct * a.weight) / 100;
    entry.weightCovered += a.weight;
    entry.breakdown.push({ type: a.type, score: score.score, maxScore: a.maxScore, weight: a.weight });
  }

  const gradeBands = await prisma.gradeBand.findMany({ orderBy: { minScore: "desc" } });
  function gradeFor(total: number) {
    return gradeBands.find((g) => total >= g.minScore && total <= g.maxScore) ?? null;
  }

  const subjects = Array.from(bySubject.values()).map((s) => {
    // Normalize in case not all weight categories have scores yet.
    const normalizedTotal = s.weightCovered > 0 ? (s.weightedTotal / s.weightCovered) * 100 : 0;
    const grade = gradeFor(normalizedTotal);
    return {
      subjectName: s.subjectName,
      total: Math.round(normalizedTotal * 10) / 10,
      grade: grade?.grade ?? "—",
      remark: grade?.remark ?? "Not yet graded",
      breakdown: s.breakdown,
    };
  });

  const overallAverage =
    subjects.length > 0
      ? Math.round((subjects.reduce((sum, s) => sum + s.total, 0) / subjects.length) * 10) / 10
      : 0;

  const attendanceRecords = await prisma.attendance.count({ where: { studentId } });
  const presentRecords = await prisma.attendance.count({
    where: { studentId, status: { in: ["PRESENT", "LATE"] } },
  });

  const remark = await prisma.reportCardRemark.findUnique({
    where: {
      studentId_academicYearId_termName: {
        studentId,
        academicYearId: enrollment.academicYearId,
        termName,
      },
    },
  });

  return {
    student,
    enrollment,
    subjects,
    overallAverage,
    attendanceRecords,
    presentRecords,
    remark,
  };
}
