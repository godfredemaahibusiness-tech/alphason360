import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const academicYears = await prisma.academicYear.findMany({
    include: { terms: true },
    orderBy: { startDate: "desc" },
  });
  const classes = await prisma.schoolClass.count();
  const subjects = await prisma.subject.count();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">School Settings</h1>
        <p className="text-sm text-slate-500">
          Core configuration for Alphason International School.
        </p>
      </div>

      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">School Information</h2>
        <dl className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-slate-400 text-xs">School name</dt>
            <dd className="text-slate-800 font-medium">Alphason International School</dd>
          </div>
          <div>
            <dt className="text-slate-400 text-xs">Location</dt>
            <dd className="text-slate-800 font-medium">Oduman, Accra, Ghana</dd>
          </div>
          <div>
            <dt className="text-slate-400 text-xs">Motto</dt>
            <dd className="text-slate-800 font-medium">God Is Our Priority</dd>
          </div>
          <div>
            <dt className="text-slate-400 text-xs">Currency</dt>
            <dd className="text-slate-800 font-medium">Ghanaian Cedi (GH₵)</dd>
          </div>
        </dl>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">Academic Structure</h2>
        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          <div className="bg-slate-50 rounded-lg px-3 py-2">
            <p className="text-xs text-slate-400">Classes</p>
            <p className="text-lg font-bold text-slate-900">{classes}</p>
          </div>
          <div className="bg-slate-50 rounded-lg px-3 py-2">
            <p className="text-xs text-slate-400">Subjects</p>
            <p className="text-lg font-bold text-slate-900">{subjects}</p>
          </div>
          <div className="bg-slate-50 rounded-lg px-3 py-2">
            <p className="text-xs text-slate-400">Academic years</p>
            <p className="text-lg font-bold text-slate-900">{academicYears.length}</p>
          </div>
        </div>

        {academicYears.map((year) => (
          <div key={year.id} className="border border-slate-100 rounded-lg p-3 mb-2 last:mb-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-800">{year.name}</p>
              {year.isCurrent && (
                <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5">
                  Current
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {year.terms.map((t) => t.name).join(" · ")}
            </p>
          </div>
        ))}
      </section>

      <p className="text-xs text-slate-400">
        Editable settings (school branding, grading system, fee categories) will be enabled
        as their respective modules are built in later phases.
      </p>
    </div>
  );
}
