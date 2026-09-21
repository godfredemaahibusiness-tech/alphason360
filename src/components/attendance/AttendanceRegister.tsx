"use client";

import { useState, useTransition } from "react";
import { clsx } from "clsx";
import { saveAttendanceAction } from "@/app/(dashboard)/attendance/actions";
import type { AttendanceStatus } from "@prisma/client";

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; tone: string }[] = [
  { value: "PRESENT", label: "Present", tone: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { value: "LATE", label: "Late", tone: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "ABSENT", label: "Absent", tone: "bg-rose-100 text-rose-700 border-rose-200" },
  { value: "EXCUSED", label: "Excused", tone: "bg-slate-100 text-slate-600 border-slate-200" },
];

export function AttendanceRegister({
  date,
  students,
  initialStatuses,
}: {
  date: string;
  students: { id: string; name: string; admissionNumber: string }[];
  initialStatuses: Record<string, AttendanceStatus>;
}) {
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>(() => {
    const base: Record<string, AttendanceStatus> = {};
    for (const s of students) base[s.id] = initialStatuses[s.id] ?? "PRESENT";
    return base;
  });
  const [isPending, startTransition] = useTransition();
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  function setStatus(studentId: string, status: AttendanceStatus) {
    setStatuses((prev) => ({ ...prev, [studentId]: status }));
    setSavedMessage(null);
  }

  function markAllPresent() {
    const next: Record<string, AttendanceStatus> = {};
    for (const s of students) next[s.id] = "PRESENT";
    setStatuses(next);
    setSavedMessage(null);
  }

  function handleSave() {
    setSavedMessage(null);
    startTransition(async () => {
      const entries = students.map((s) => ({ studentId: s.id, status: statuses[s.id] }));
      const result = await saveAttendanceAction(date, entries);
      setSavedMessage(`Saved attendance for ${result.saved} students.`);
    });
  }

  const presentCount = Object.values(statuses).filter((s) => s === "PRESENT" || s === "LATE").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-4">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-slate-900">{presentCount}</span> / {students.length} marked
          present or late
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={markAllPresent}
            className="text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg px-3 py-2"
          >
            Mark all present
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="text-xs font-medium bg-sky-700 hover:bg-sky-800 disabled:opacity-60 text-white rounded-lg px-4 py-2"
          >
            {isPending ? "Saving..." : "Save Attendance"}
          </button>
        </div>
      </div>

      {savedMessage && (
        <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">{savedMessage}</p>
      )}

      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
        {students.map((s) => (
          <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-800">{s.name}</p>
              <p className="text-xs text-slate-400 font-mono">{s.admissionNumber}</p>
            </div>
            <div className="flex gap-1.5">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(s.id, opt.value)}
                  className={clsx(
                    "text-xs font-medium rounded-full px-3 py-1.5 border transition-colors",
                    statuses[s.id] === opt.value
                      ? opt.tone
                      : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
        {students.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-slate-400">
            No students enrolled in this class.
          </p>
        )}
      </div>
    </div>
  );
}
