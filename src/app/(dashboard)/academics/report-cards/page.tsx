import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ReportCardsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; classId?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const classId = params.classId ?? "";

  const classes = await prisma.schoolClass.findMany({ orderBy: { order: "asc" } });

  const students = await prisma.student.findMany({
    where: {
      status: "ACTIVE",
      ...(classId ? { enrollments: { some: { classId } } } : {}),
      ...(q
        ? { OR: [{ firstName: { contains: q } }, { lastName: { contains: q } }, { admissionNumber: { contains: q } }] }
        : {}),
    },
    include: { enrollments: { include: { class: true }, take: 1 } },
    orderBy: { lastName: "asc" },
    take: 30,
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Report Cards</h1>
        <p className="text-sm text-slate-500">Select a student to view their Term 1 report card.</p>
      </div>

      <form className="flex flex-wrap gap-2 bg-white border border-slate-200 rounded-xl p-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name or admission number..."
          className="flex-1 min-w-[200px] rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <select
          name="classId"
          defaultValue={classId}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="">All classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg px-4 py-2"
        >
          Search
        </button>
      </form>

      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
        {students.map((s) => (
          <Link
            key={s.id}
            href={`/academics/report-cards/${s.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
          >
            <div>
              <p className="text-sm font-medium text-slate-800">
                {s.firstName} {s.lastName}
              </p>
              <p className="text-xs text-slate-400 font-mono">{s.admissionNumber}</p>
            </div>
            <span className="text-xs text-slate-500">{s.enrollments[0]?.class.name ?? "—"}</span>
          </Link>
        ))}
        {students.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-slate-400">No students found.</p>
        )}
      </div>
    </div>
  );
}
