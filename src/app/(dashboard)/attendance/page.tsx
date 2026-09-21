import { prisma } from "@/lib/prisma";
import { AttendanceRegister } from "@/components/attendance/AttendanceRegister";

function todayIso() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; date?: string }>;
}) {
  const params = await searchParams;
  const date = params.date ?? todayIso();
  const dateStart = new Date(date);
  dateStart.setHours(0, 0, 0, 0);
  const dateEnd = new Date(dateStart);
  dateEnd.setDate(dateEnd.getDate() + 1);

  const currentYear = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
  const classes = await prisma.schoolClass.findMany({ orderBy: { order: "asc" } });
  const classId = params.classId || classes[0]?.id || "";

  const enrollments = currentYear
    ? await prisma.enrollment.findMany({
        where: { classId, academicYearId: currentYear.id },
        include: { student: true },
        orderBy: { student: { lastName: "asc" } },
      })
    : [];

  const existingAttendance = await prisma.attendance.findMany({
    where: {
      date: { gte: dateStart, lt: dateEnd },
      studentId: { in: enrollments.map((e) => e.studentId) },
    },
  });
  const initialStatuses = Object.fromEntries(
    existingAttendance.map((a) => [a.studentId, a.status])
  );

  const students = enrollments.map((e) => ({
    id: e.student.id,
    name: `${e.student.firstName} ${e.student.lastName}`,
    admissionNumber: e.student.admissionNumber,
  }));

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Attendance</h1>
        <p className="text-sm text-slate-500">Take or review daily class attendance.</p>
      </div>

      <form className="flex flex-wrap gap-2 bg-white border border-slate-200 rounded-xl p-3">
        <select
          name="classId"
          defaultValue={classId}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          name="date"
          defaultValue={date}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <button
          type="submit"
          className="text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg px-4 py-2"
        >
          Load
        </button>
      </form>

      <AttendanceRegister
        key={`${classId}-${date}`}
        date={date}
        students={students}
        initialStatuses={initialStatuses}
      />
    </div>
  );
}
