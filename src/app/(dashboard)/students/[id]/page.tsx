import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatGHS } from "@/lib/format";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      enrollments: { include: { class: true, section: true }, take: 1 },
      guardians: { include: { guardian: true } },
      invoices: { orderBy: { createdAt: "desc" }, take: 5 },
      attendance: { orderBy: { date: "desc" }, take: 10 },
    },
  });

  if (!student) notFound();

  const enrollment = student.enrollments[0];
  const presentCount = student.attendance.filter((a) => a.status === "PRESENT").length;

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/students" className="text-sm text-sky-700 hover:underline">
        ← Back to Students
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-wrap items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-sky-700 text-white text-xl font-bold flex items-center justify-center">
          {student.firstName[0]}
          {student.lastName[0]}
        </div>
        <div className="flex-1 min-w-[200px]">
          <h1 className="text-lg font-bold text-slate-900">
            {student.firstName} {student.lastName}
          </h1>
          <p className="text-sm text-slate-500">
            {student.admissionNumber} ·{" "}
            {enrollment ? `${enrollment.class.name}${enrollment.section ? ` ${enrollment.section.name}` : ""}` : "Unassigned"}
          </p>
        </div>
        <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-full px-3 py-1">
          {student.status}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <section className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">Personal Information</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-400">Gender</dt>
              <dd className="text-slate-700">{student.gender === "MALE" ? "Male" : "Female"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Date of birth</dt>
              <dd className="text-slate-700">
                {student.dateOfBirth.toLocaleDateString("en-GB")}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Admission date</dt>
              <dd className="text-slate-700">
                {student.admissionDate.toLocaleDateString("en-GB")}
              </dd>
            </div>
          </dl>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">Guardian(s)</h2>
          <div className="space-y-3">
            {student.guardians.map((sg) => (
              <div key={sg.id} className="text-sm">
                <p className="font-medium text-slate-800">
                  {sg.guardian.name}{" "}
                  <span className="text-xs text-slate-400 font-normal">
                    ({sg.guardian.relationship})
                  </span>
                </p>
                <p className="text-slate-500 text-xs">{sg.guardian.phone}</p>
              </div>
            ))}
            {student.guardians.length === 0 && (
              <p className="text-sm text-slate-400">No guardian on record.</p>
            )}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">Fee Invoices</h2>
          <div className="space-y-2">
            {student.invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-slate-700">{inv.invoiceNumber}</p>
                  <p className="text-xs text-slate-400">{inv.termName}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-slate-800">{formatGHS(inv.totalAmount)}</p>
                  <span
                    className={`text-[10px] font-semibold rounded-full px-2 py-0.5 ${
                      inv.status === "PAID"
                        ? "bg-emerald-50 text-emerald-700"
                        : inv.status === "PARTIAL"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
            {student.invoices.length === 0 && (
              <p className="text-sm text-slate-400">No invoices yet.</p>
            )}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">
            Recent Attendance ({presentCount}/{student.attendance.length} present)
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {student.attendance.map((a) => (
              <span
                key={a.id}
                title={`${a.date.toLocaleDateString("en-GB")} — ${a.status}`}
                className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
                  a.status === "PRESENT"
                    ? "bg-emerald-100 text-emerald-700"
                    : a.status === "LATE"
                    ? "bg-amber-100 text-amber-700"
                    : a.status === "EXCUSED"
                    ? "bg-slate-100 text-slate-500"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {a.date.getDate()}
              </span>
            ))}
            {student.attendance.length === 0 && (
              <p className="text-sm text-slate-400">No attendance recorded.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
