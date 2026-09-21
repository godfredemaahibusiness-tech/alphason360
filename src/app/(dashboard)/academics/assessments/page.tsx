import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AssessmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string }>;
}) {
  const params = await searchParams;
  const classes = await prisma.schoolClass.findMany({ orderBy: { order: "asc" } });
  const classId = params.classId || "";

  const assessments = await prisma.assessment.findMany({
    where: classId ? { classId } : undefined,
    include: {
      class: true,
      subject: true,
      _count: { select: { scores: true } },
    },
    orderBy: [{ classId: "asc" }, { subjectId: "asc" }, { type: "asc" }],
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Gradebook</h1>
          <p className="text-sm text-slate-500">
            Assessments and scores — Term 1, {assessments.length} assessment(s)
          </p>
        </div>
      </div>

      <form className="flex flex-wrap gap-2 bg-white border border-slate-200 rounded-xl p-3">
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
              <th className="text-left px-4 py-3 font-medium">Assessment</th>
              <th className="text-left px-4 py-3 font-medium">Class</th>
              <th className="text-left px-4 py-3 font-medium">Subject</th>
              <th className="text-left px-4 py-3 font-medium">Weight</th>
              <th className="text-left px-4 py-3 font-medium">Scores entered</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {assessments.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/academics/assessments/${a.id}`} className="font-medium text-slate-800 hover:text-sky-700">
                    {a.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{a.class.name}</td>
                <td className="px-4 py-3 text-slate-600">{a.subject.name}</td>
                <td className="px-4 py-3 text-slate-500">{a.weight}%</td>
                <td className="px-4 py-3 text-slate-500">{a._count.scores}</td>
              </tr>
            ))}
            {assessments.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                  No assessments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
