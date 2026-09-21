import { prisma } from "@/lib/prisma";
import { NewAssignmentForm } from "@/components/academics/NewAssignmentForm";

export default async function AssignmentsPage() {
  const [assignments, classes, subjects] = await Promise.all([
    prisma.assignment.findMany({
      include: { class: true, subject: true },
      orderBy: { dueDate: "asc" },
      take: 50,
    }),
    prisma.schoolClass.findMany({ orderBy: { order: "asc" } }),
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
  ]);

  const today = new Date();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Assignments</h1>
        <p className="text-sm text-slate-500">Homework posted across all classes.</p>
      </div>

      <NewAssignmentForm classes={classes} subjects={subjects} />

      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
        {assignments.map((a) => {
          const overdue = a.dueDate < today;
          return (
            <div key={a.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-800">{a.title}</p>
                <p className="text-xs text-slate-400">
                  {a.class.name} · {a.subject.name}
                </p>
              </div>
              <span
                className={`text-xs font-semibold rounded-full px-2.5 py-1 ${
                  overdue ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-600"
                }`}
              >
                Due {a.dueDate.toLocaleDateString("en-GB")}
              </span>
            </div>
          );
        })}
        {assignments.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-slate-400">No assignments yet.</p>
        )}
      </div>
    </div>
  );
}
