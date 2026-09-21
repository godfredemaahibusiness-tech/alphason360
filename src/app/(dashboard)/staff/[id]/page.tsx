import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ROLE_LABELS } from "@/lib/roles";

const LEAVE_STATUS_TONES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  APPROVED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-rose-50 text-rose-700",
};

export default async function StaffDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const staff = await prisma.staffProfile.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!staff) notFound();

  const [attendance, leaveRequests] = await Promise.all([
    prisma.staffAttendance.findMany({
      where: { userId: staff.userId },
      orderBy: { date: "desc" },
      take: 14,
    }),
    prisma.leaveRequest.findMany({
      where: { userId: staff.userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const presentCount = attendance.filter((a) => a.status === "PRESENT").length;

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/staff" className="text-sm text-sky-700 hover:underline">
        ← Back to Staff
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-wrap items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-sky-700 text-white text-xl font-bold flex items-center justify-center">
          {staff.user.name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")}
        </div>
        <div className="flex-1 min-w-[200px]">
          <h1 className="text-lg font-bold text-slate-900">{staff.user.name}</h1>
          <p className="text-sm text-slate-500">
            {staff.staffId} · {staff.department} · {ROLE_LABELS[staff.user.role]}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <section className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">Staff Information</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-400">Email</dt>
              <dd className="text-slate-700">{staff.user.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Phone</dt>
              <dd className="text-slate-700">{staff.phone ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Qualification</dt>
              <dd className="text-slate-700">{staff.qualification ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Employment date</dt>
              <dd className="text-slate-700">{staff.employmentDate.toLocaleDateString("en-GB")}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Emergency contact</dt>
              <dd className="text-slate-700">{staff.emergencyContact ?? "—"}</dd>
            </div>
          </dl>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">
            Recent Attendance ({presentCount}/{attendance.length} present)
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {attendance.map((a) => (
              <span
                key={a.id}
                title={`${a.date.toLocaleDateString("en-GB")} — ${a.status}`}
                className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold ${
                  a.status === "PRESENT"
                    ? "bg-emerald-100 text-emerald-700"
                    : a.status === "LATE"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {a.date.getDate()}
              </span>
            ))}
            {attendance.length === 0 && <p className="text-sm text-slate-400">No attendance recorded.</p>}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 p-5 md:col-span-2">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">Leave History</h2>
          <div className="divide-y divide-slate-100">
            {leaveRequests.map((l) => (
              <div key={l.id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <p className="text-slate-700">
                    {l.type} · {l.startDate.toLocaleDateString("en-GB")} – {l.endDate.toLocaleDateString("en-GB")}
                  </p>
                  {l.reason && <p className="text-xs text-slate-400">{l.reason}</p>}
                </div>
                <span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${LEAVE_STATUS_TONES[l.status]}`}>
                  {l.status}
                </span>
              </div>
            ))}
            {leaveRequests.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-400">No leave requests.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
