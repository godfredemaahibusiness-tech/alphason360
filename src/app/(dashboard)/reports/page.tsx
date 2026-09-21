import Link from "next/link";
import { getSchoolReport } from "@/lib/schoolReport";
import { formatGHS } from "@/lib/format";
import { SchoolCrest } from "@/components/SchoolCrest";
import { PrintButton } from "@/components/academics/PrintButton";

export default async function ReportsPage() {
  const r = await getSchoolReport();

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-xl font-bold text-slate-900">School Report</h1>
          <p className="text-sm text-slate-500">
            Generated {r.generatedAt.toLocaleString("en-GB")} · Academic Year {r.academicYearName}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/finance/reports"
            className="text-sm font-medium bg-white border border-slate-200 hover:border-sky-300 text-slate-600 rounded-lg px-3 py-2"
          >
            Financial Reports
          </Link>
          <PrintButton />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6 print:border-none print:shadow-none">
        <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
          <SchoolCrest size={44} />
          <div>
            <h2 className="text-base font-bold text-slate-900">Alphason International School</h2>
            <p className="text-xs text-slate-500">Oduman, Accra, Ghana — Monthly School Report</p>
          </div>
          <div className="ml-auto text-right text-xs text-slate-400">
            <p>Academic Year {r.academicYearName}</p>
            <p>{r.generatedAt.toLocaleDateString("en-GB")}</p>
          </div>
        </div>

        <section>
          <h3 className="text-sm font-semibold text-slate-800 mb-2">Enrollment</h3>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="bg-slate-50 rounded-lg px-3 py-2">
              <p className="text-xs text-slate-400">Total Students</p>
              <p className="text-lg font-bold text-slate-900">{r.enrollment.totalStudents}</p>
            </div>
            <div className="bg-slate-50 rounded-lg px-3 py-2">
              <p className="text-xs text-slate-400">Boys</p>
              <p className="text-lg font-bold text-slate-900">{r.enrollment.maleCount}</p>
            </div>
            <div className="bg-slate-50 rounded-lg px-3 py-2">
              <p className="text-xs text-slate-400">Girls</p>
              <p className="text-lg font-bold text-slate-900">{r.enrollment.femaleCount}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {r.enrollment.byClass.map((c) => (
              <span key={c.name} className="text-xs bg-slate-50 text-slate-600 rounded-full px-2.5 py-1">
                {c.name}: {c.count}
              </span>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-slate-800 mb-2">Attendance</h3>
          <p className="text-sm text-slate-600">
            Average student attendance over the last {r.attendance.windowDays} days:{" "}
            <span className="font-bold text-slate-900">{r.attendance.rate}%</span>
          </p>
          <p className="text-sm text-slate-600 mt-1">
            Staff attendance over the same period:{" "}
            <span className="font-bold text-slate-900">{r.staff.attendanceRate}%</span> ({r.staff.totalStaff}{" "}
            staff)
          </p>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-slate-800 mb-2">Academic Performance</h3>
          {r.academics.trend.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {r.academics.trend.map((t) => (
                <span key={t.term} className="text-xs bg-violet-50 text-violet-700 rounded-full px-2.5 py-1">
                  {t.term}: {t.average}%
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No academic performance data recorded.</p>
          )}
        </section>

        <section>
          <h3 className="text-sm font-semibold text-slate-800 mb-2">Financial Summary</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-lg px-3 py-2">
              <p className="text-xs text-slate-400">Billed</p>
              <p className="text-sm font-bold text-slate-900">{formatGHS(r.finance.billed)}</p>
            </div>
            <div className="bg-slate-50 rounded-lg px-3 py-2">
              <p className="text-xs text-slate-400">Collected ({r.finance.collectionRate}%)</p>
              <p className="text-sm font-bold text-emerald-700">{formatGHS(r.finance.collected)}</p>
            </div>
            <div className="bg-slate-50 rounded-lg px-3 py-2">
              <p className="text-xs text-slate-400">Outstanding</p>
              <p className="text-sm font-bold text-rose-700">{formatGHS(r.finance.outstanding)}</p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-slate-800 mb-2">Admissions Pipeline</h3>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(r.admissions).map(([stage, count]) => (
              <span key={stage} className="text-xs bg-amber-50 text-amber-700 rounded-full px-2.5 py-1">
                {stage}: {count}
              </span>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-slate-800 mb-2">Library &amp; Transport</h3>
          <p className="text-sm text-slate-600">
            {r.library.totalBooks} titles in catalogue, {r.library.activeBorrows} currently borrowed.
          </p>
          <p className="text-sm text-slate-600 mt-1">
            {r.transport.totalVehicles} vehicles in service, {r.transport.studentsAssigned} students on a
            transport route.
          </p>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-slate-800 mb-2">Upcoming Events</h3>
          <div className="space-y-1">
            {r.events.map((e) => (
              <p key={e.id} className="text-sm text-slate-600">
                {e.startDate.toLocaleDateString("en-GB")} — {e.title}
              </p>
            ))}
            {r.events.length === 0 && <p className="text-sm text-slate-400">No upcoming events.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
