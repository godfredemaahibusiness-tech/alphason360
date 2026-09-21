import { prisma } from "@/lib/prisma";

const DAY_LABELS: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
};

export default async function TimetablePage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string }>;
}) {
  const params = await searchParams;
  const classes = await prisma.schoolClass.findMany({ orderBy: { order: "asc" } });
  const classId = params.classId || classes[0]?.id || "";

  const slots = await prisma.timetableSlot.findMany({
    where: { classId },
    include: { subject: true, teacher: { include: { user: true } } },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  const periodTimes = Array.from(new Set(slots.map((s) => s.startTime))).sort();
  const days = [1, 2, 3, 4, 5];

  function slotAt(day: number, start: string) {
    return slots.find((s) => s.dayOfWeek === day && s.startTime === start);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Timetable</h1>
        <p className="text-sm text-slate-500">Weekly class schedule.</p>
      </div>

      <form className="flex flex-wrap gap-2 bg-white border border-slate-200 rounded-xl p-3">
        <select
          name="classId"
          defaultValue={classId}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
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
          View
        </button>
      </form>

      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-3 py-3 font-medium">Time</th>
              {days.map((d) => (
                <th key={d} className="text-left px-3 py-3 font-medium">
                  {DAY_LABELS[d]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {periodTimes.map((start) => {
              const end = slots.find((s) => s.startTime === start)?.endTime;
              return (
                <tr key={start}>
                  <td className="px-3 py-3 text-xs text-slate-400 font-mono whitespace-nowrap">
                    {start}–{end}
                  </td>
                  {days.map((d) => {
                    const slot = slotAt(d, start);
                    return (
                      <td key={d} className="px-3 py-2 align-top">
                        {slot ? (
                          <div className="bg-sky-50 border border-sky-100 rounded-lg px-2.5 py-2">
                            <p className="text-xs font-semibold text-sky-800">{slot.subject.name}</p>
                            <p className="text-[11px] text-sky-600">{slot.teacher.user.name}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {periodTimes.length === 0 && (
              <tr>
                <td colSpan={days.length + 1} className="px-3 py-10 text-center text-slate-400">
                  No timetable slots for this class yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
