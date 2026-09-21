import { prisma } from "@/lib/prisma";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export async function getSchoolReport() {
  const today = startOfDay(new Date());
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const currentYear = await prisma.academicYear.findFirst({ where: { isCurrent: true } });

  const [
    totalStudents,
    maleCount,
    femaleCount,
    studentsByClass,
    attendancePresent,
    attendanceTotal,
    performanceSnapshots,
    totalBilled,
    totalCollected,
    totalStaff,
    staffPresent,
    staffAttendanceTotal,
    admissionCounts,
    upcomingEvents,
    totalBooks,
    activeBorrows,
    totalVehicles,
    transportAssigned,
  ] = await Promise.all([
    prisma.student.count({ where: { status: "ACTIVE" } }),
    prisma.student.count({ where: { status: "ACTIVE", gender: "MALE" } }),
    prisma.student.count({ where: { status: "ACTIVE", gender: "FEMALE" } }),
    prisma.schoolClass.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { enrollments: true } } },
    }),
    prisma.attendance.count({
      where: { date: { gte: thirtyDaysAgo }, status: { in: ["PRESENT", "LATE"] } },
    }),
    prisma.attendance.count({ where: { date: { gte: thirtyDaysAgo } } }),
    currentYear
      ? prisma.performanceSnapshot.findMany({ where: { academicYearId: currentYear.id } })
      : Promise.resolve([]),
    prisma.invoice.aggregate({ _sum: { totalAmount: true } }),
    prisma.invoice.aggregate({ _sum: { amountPaid: true } }),
    prisma.staffProfile.count(),
    prisma.staffAttendance.count({
      where: { date: { gte: thirtyDaysAgo }, status: { in: ["PRESENT", "LATE"] } },
    }),
    prisma.staffAttendance.count({ where: { date: { gte: thirtyDaysAgo } } }),
    prisma.applicant.groupBy({ by: ["stage"], _count: true }),
    prisma.schoolEvent.findMany({ where: { startDate: { gte: today } }, orderBy: { startDate: "asc" }, take: 5 }),
    prisma.book.count(),
    prisma.borrowRecord.count({ where: { returnDate: null } }),
    prisma.vehicle.count(),
    prisma.studentTransport.count(),
  ]);

  const billed = totalBilled._sum.totalAmount ?? 0;
  const collected = totalCollected._sum.amountPaid ?? 0;

  return {
    generatedAt: new Date(),
    academicYearName: currentYear?.name ?? "—",
    enrollment: {
      totalStudents,
      maleCount,
      femaleCount,
      byClass: studentsByClass.map((c) => ({ name: c.name, count: c._count.enrollments })),
    },
    attendance: {
      rate: attendanceTotal > 0 ? Math.round((attendancePresent / attendanceTotal) * 1000) / 10 : 0,
      windowDays: 30,
    },
    academics: {
      trend: performanceSnapshots.map((s) => ({ term: s.termName, average: s.averageScore })),
    },
    finance: {
      billed,
      collected,
      outstanding: billed - collected,
      collectionRate: billed > 0 ? Math.round((collected / billed) * 1000) / 10 : 0,
    },
    staff: {
      totalStaff,
      attendanceRate:
        staffAttendanceTotal > 0 ? Math.round((staffPresent / staffAttendanceTotal) * 1000) / 10 : 0,
    },
    admissions: Object.fromEntries(admissionCounts.map((a) => [a.stage, a._count])),
    events: upcomingEvents,
    library: { totalBooks, activeBorrows },
    transport: { totalVehicles, studentsAssigned: transportAssigned },
  };
}
