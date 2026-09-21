import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ClockInOut } from "@/components/staff/ClockInOut";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

const STATUS_TONES: Record<string, string> = {
  PRESENT: "bg-emerald-50 text-emerald-700",
  LATE: "bg-amber-50 text-amber-700",
  ABSENT: "bg-rose-50 text-rose-700",
};

export default async function StaffAttendancePage() {
  const session = await auth();
  const today = startOfDay(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [records, mine] = await Promise.all([
    prisma.staffAttendance.findMany({
      where: { date: { gte: today, lt: tomorrow } },
      include: { user: true },
      orderBy: { user: { name: "asc" } },
    }),
    prisma.staffAttendance.findFirst({
      where: { userId: session!.user.id, date: { gte: today, lt: tomorrow } },
    }),
  ]);

  return (
    <div className="space-y-4">
      <Link href="/staff" className="text-sm text-sky-700 hover:underline">
        ← Back to Staff
      </Link>

      <div>
        <h1 className="text-xl font-bold text-slate-900">Staff Attendance</h1>
        <p className="text-sm text-slate-500">{today.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</p>
      </div>

      <ClockInOut
        clockIn={mine?.clockIn ? mine.clockIn.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : null}
        clockOut={mine?.clockOut ? mine.clockOut.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : null}
      />

      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
        {records.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-800">{r.user.name}</p>
              <p className="text-xs text-slate-400">
                {r.clockIn
                  ? `In ${r.clockIn.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`
                  : "Not clocked in"}
                {r.clockOut ? ` · Out ${r.clockOut.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}` : ""}
              </p>
            </div>
            <span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${STATUS_TONES[r.status]}`}>
              {r.status}
            </span>
          </div>
        ))}
        {records.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-slate-400">No attendance recorded today.</p>
        )}
      </div>
    </div>
  );
}
