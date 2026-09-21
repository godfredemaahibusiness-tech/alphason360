import { prisma } from "@/lib/prisma";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export async function getDashboardData() {
  const currentYear = await prisma.academicYear.findFirst({ where: { isCurrent: true } });

  const [totalStudents, maleCount, femaleCount, totalTeachers, admissionsCount] =
    await Promise.all([
      prisma.student.count({ where: { status: "ACTIVE" } }),
      prisma.student.count({ where: { status: "ACTIVE", gender: "MALE" } }),
      prisma.student.count({ where: { status: "ACTIVE", gender: "FEMALE" } }),
      prisma.teacher.count(),
      currentYear
        ? prisma.applicant.count({ where: { academicYearId: currentYear.id } })
        : Promise.resolve(0),
    ]);

  // Attendance trend: last 7 school days
  const days: { day: string; rate: number }[] = [];
  const today = startOfDay(new Date());
  const cursor = new Date(today);
  while (days.length < 7) {
    if (cursor.getDay() !== 0 && cursor.getDay() !== 6) {
      const dayStart = startOfDay(cursor);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const [present, total] = await Promise.all([
        prisma.attendance.count({
          where: { date: { gte: dayStart, lt: dayEnd }, status: { in: ["PRESENT", "LATE"] } },
        }),
        prisma.attendance.count({ where: { date: { gte: dayStart, lt: dayEnd } } }),
      ]);

      days.unshift({
        day: dayStart.toLocaleDateString("en-GB", { weekday: "short" }),
        rate: total > 0 ? Math.round((present / total) * 1000) / 10 : 0,
      });
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  const todayAttendanceRate = days[days.length - 1]?.rate ?? 0;

  // Finance
  const [billedAgg, paidAgg, todayPaidAgg] = await Promise.all([
    prisma.invoice.aggregate({ _sum: { totalAmount: true } }),
    prisma.invoice.aggregate({ _sum: { amountPaid: true } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { paidAt: { gte: today } },
    }),
  ]);
  const totalBilled = billedAgg._sum.totalAmount ?? 0;
  const totalCollected = paidAgg._sum.amountPaid ?? 0;
  const outstanding = totalBilled - totalCollected;
  const todaysCollections = todayPaidAgg._sum.amount ?? 0;

  // Fee collection by month (last 6 months)
  const payments = await prisma.payment.findMany({
    select: { amount: true, paidAt: true },
  });
  const monthBuckets = new Map<string, number>();
  const monthCursor = new Date(today.getFullYear(), today.getMonth() - 5, 1);
  for (let i = 0; i < 6; i++) {
    const key = monthCursor.toLocaleDateString("en-GB", { month: "short" });
    monthBuckets.set(key, 0);
    monthCursor.setMonth(monthCursor.getMonth() + 1);
  }
  for (const p of payments) {
    const key = p.paidAt.toLocaleDateString("en-GB", { month: "short" });
    if (monthBuckets.has(key)) {
      monthBuckets.set(key, (monthBuckets.get(key) ?? 0) + p.amount);
    }
  }
  const feeCollectionTrend = Array.from(monthBuckets.entries()).map(([month, amount]) => ({
    month,
    amount: Math.round(amount),
  }));

  // Academic performance trend
  const snapshots = currentYear
    ? await prisma.performanceSnapshot.findMany({
        where: { academicYearId: currentYear.id },
        orderBy: { id: "asc" },
      })
    : [];
  const performanceTrend = snapshots.map((s) => ({
    term: s.termName.replace(/\s*\(.*\)/, ""),
    average: s.averageScore,
  }));

  // Students by class
  const classes = await prisma.schoolClass.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { enrollments: true } } },
  });
  const studentsByClass = classes.map((c) => ({
    name: c.name,
    count: c._count.enrollments,
  }));

  const [events, activity] = await Promise.all([
    prisma.schoolEvent.findMany({ orderBy: { startDate: "asc" }, take: 4 }),
    prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  return {
    totalStudents,
    maleCount,
    femaleCount,
    totalTeachers,
    admissionsCount,
    todayAttendanceRate,
    attendanceTrend: days,
    totalBilled,
    totalCollected,
    outstanding,
    todaysCollections,
    feeCollectionTrend,
    performanceTrend,
    studentsByClass,
    events,
    activity,
    currentYearName: currentYear?.name ?? "—",
  };
}
