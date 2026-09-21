"use client";

import { useState, useTransition } from "react";
import { saveScoresAction } from "@/app/(dashboard)/academics/assessments/actions";

export function ScoreSheet({
  assessmentId,
  maxScore,
  students,
  initialScores,
}: {
  assessmentId: string;
  maxScore: number;
  students: { id: string; name: string; admissionNumber: string }[];
  initialScores: Record<string, number>;
}) {
  const [scores, setScores] = useState<Record<string, string>>(() => {
    const base: Record<string, string> = {};
    for (const s of students) {
      base[s.id] = initialScores[s.id] !== undefined ? String(initialScores[s.id]) : "";
    }
    return base;
  });
  const [isPending, startTransition] = useTransition();
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  function handleSave() {
    setSavedMessage(null);
    startTransition(async () => {
      const entries = students
        .map((s) => ({ studentId: s.id, score: Number(scores[s.id]) }))
        .filter((e) => !Number.isNaN(e.score) && scores[e.studentId] !== "");
      const result = await saveScoresAction(assessmentId, entries);
      setSavedMessage(`Saved scores for ${result.saved} students.`);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-4">
        <p className="text-sm text-slate-600">Max score: {maxScore}</p>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="text-xs font-medium bg-sky-700 hover:bg-sky-800 disabled:opacity-60 text-white rounded-lg px-4 py-2"
        >
          {isPending ? "Saving..." : "Save Scores"}
        </button>
      </div>

      {savedMessage && (
        <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">{savedMessage}</p>
      )}

      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
        {students.map((s) => (
          <div key={s.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-800">{s.name}</p>
              <p className="text-xs text-slate-400 font-mono">{s.admissionNumber}</p>
            </div>
            <input
              type="number"
              min={0}
              max={maxScore}
              value={scores[s.id]}
              onChange={(e) => {
                setScores((prev) => ({ ...prev, [s.id]: e.target.value }));
                setSavedMessage(null);
              }}
              className="w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
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
