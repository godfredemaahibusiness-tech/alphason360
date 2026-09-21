import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ROLE_LABELS } from "@/lib/roles";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default async function StaffPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const today = startOfDay(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [staff, totalStaff, presentToday, pendingLeave] = await Promise.all([
    prisma.staffProfile.findMany({
      where: q
        ? { user: { name: { contains: q } } }
        : undefined,
      include: { user: true },
      orderBy: { user: { name: "asc" } },
      take: 50,
    }),
    prisma.staffProfile.count(),
    prisma.staffAttendance.count({
      where: { date: { gte: today, lt: tomorrow }, status: { in: ["PRESENT", "LATE"] } },
    }),
    prisma.leaveRequest.count({ where: { status: "PENDING" } }),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Staff</h1>
          <p className="text-sm text-slate-500">{totalStaff} staff on record.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/staff/attendance"
            className="text-sm font-medium bg-white border border-slate-200 hover:border-sky-300 text-slate-600 rounded-lg px-3 py-2"
          >
            Attendance
          </Link>
          <Link
            href="/staff/leave"
            className="text-sm font-medium bg-sky-700 hover:bg-sky-800 text-white rounded-lg px-3 py-2"
          >
            Leave Requests
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-400">Present Today</p>
          <p className="text-xl font-bold text-emerald-700 mt-1">
            {presentToday}/{totalStaff}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-400">Pending Leave</p>
          <p className="text-xl font-bold text-amber-700 mt-1">{pendingLeave}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 hidden sm:block">
          <p className="text-xs text-slate-400">Total Staff</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{totalStaff}</p>
        </div>
      </div>

      <form className="flex gap-2 bg-white border border-slate-200 rounded-xl p-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search staff by name..."
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <button
          type="submit"
          className="text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg px-4 py-2"
        >
          Search
        </button>
      </form>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Staff ID</th>
              <th className="text-left px-4 py-3 font-medium">Department</th>
              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staff.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/staff/${s.id}`} className="font-medium text-slate-800 hover:text-sky-700">
                    {s.user.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-500 font-mono text-xs">{s.staffId}</td>
                <td className="px-4 py-3 text-slate-600">{s.department}</td>
                <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{ROLE_LABELS[s.user.role]}</td>
              </tr>
            ))}
            {staff.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                  No staff found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
