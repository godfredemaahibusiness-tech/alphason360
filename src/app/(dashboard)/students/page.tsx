import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { NewStudentForm } from "@/components/students/NewStudentForm";

const PAGE_SIZE = 20;

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; classId?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const classId = params.classId ?? "";

  const where = {
    status: "ACTIVE" as const,
    ...(classId ? { enrollments: { some: { classId } } } : {}),
    ...(q
      ? {
          OR: [
            { firstName: { contains: q } },
            { lastName: { contains: q } },
            { admissionNumber: { contains: q } },
          ],
        }
      : {}),
  };

  const [students, total, classes] = await Promise.all([
    prisma.student.findMany({
      where,
      include: {
        enrollments: { include: { class: true, section: true }, take: 1 },
        guardians: { include: { guardian: true }, where: { isPrimary: true }, take: 1 },
      },
      orderBy: { lastName: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.student.count({ where }),
    prisma.schoolClass.findMany({ orderBy: { order: "asc" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(p: number) {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (classId) sp.set("classId", classId);
    sp.set("page", String(p));
    return `/students?${sp.toString()}`;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Students</h1>
        <p className="text-sm text-slate-500">{total} active students</p>
      </div>

      <NewStudentForm classes={classes} />

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
          Filter
        </button>
      </form>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Student</th>
              <th className="text-left px-4 py-3 font-medium">Admission No.</th>
              <th className="text-left px-4 py-3 font-medium">Class</th>
              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Guardian</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Gender</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((s) => {
              const enrollment = s.enrollments[0];
              const guardian = s.guardians[0]?.guardian;
              return (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/students/${s.id}`}
                      className="font-medium text-slate-800 hover:text-sky-700"
                    >
                      {s.firstName} {s.lastName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                    {s.admissionNumber}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {enrollment ? `${enrollment.class.name}${enrollment.section ? ` ${enrollment.section.name}` : ""}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">
                    {guardian?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-500 hidden md:table-cell">
                    {s.gender === "MALE" ? "Male" : "Female"}
                  </td>
                </tr>
              );
            })}
            {students.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Link
              href={pageHref(Math.max(1, page - 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
            >
              Previous
            </Link>
            <Link
              href={pageHref(Math.min(totalPages, page + 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
            >
              Next
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
