"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  advanceStageAction,
  enrollApplicantAction,
  updateNotesAction,
} from "@/app/(dashboard)/admissions/actions";
import type { AdmissionStage } from "@prisma/client";

const NEXT_STAGES: Partial<Record<AdmissionStage, AdmissionStage[]>> = {
  INQUIRY: ["APPLIED", "WAITLISTED", "REJECTED"],
  APPLIED: ["INTERVIEW", "WAITLISTED", "REJECTED"],
  INTERVIEW: ["ACCEPTED", "WAITLISTED", "REJECTED"],
  WAITLISTED: ["APPLIED", "REJECTED"],
};

const STAGE_LABELS: Record<AdmissionStage, string> = {
  INQUIRY: "Inquiry",
  APPLIED: "Mark Applied",
  INTERVIEW: "Schedule Interview",
  ACCEPTED: "Accept",
  ENROLLED: "Enrolled",
  WAITLISTED: "Waitlist",
  REJECTED: "Reject",
};

export function ApplicantActions({
  id,
  stage,
  notes,
}: {
  id: string;
  stage: AdmissionStage;
  notes: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [noteText, setNoteText] = useState(notes ?? "");
  const [enrollResult, setEnrollResult] = useState<{ error: string | null; studentId?: string } | null>(null);

  function advance(next: AdmissionStage) {
    startTransition(async () => {
      await advanceStageAction(id, next);
      router.refresh();
    });
  }

  function saveNotes() {
    startTransition(async () => {
      await updateNotesAction(id, noteText);
      router.refresh();
    });
  }

  function enroll() {
    startTransition(async () => {
      const result = await enrollApplicantAction(id);
      setEnrollResult(result);
      router.refresh();
    });
  }

  const nextOptions = NEXT_STAGES[stage] ?? [];

  return (
    <div className="space-y-4">
      {stage === "ACCEPTED" && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <p className="text-sm text-emerald-800 mb-2">
            Accepted — enroll this applicant to create their student record, guardian profile, and Term 1
            enrollment.
          </p>
          <button
            type="button"
            disabled={isPending}
            onClick={enroll}
            className="text-sm font-medium bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-lg px-4 py-2"
          >
            {isPending ? "Enrolling..." : "Enroll Student"}
          </button>
          {enrollResult?.error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2 mt-2">{enrollResult.error}</p>
          )}
        </div>
      )}

      {nextOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {nextOptions.map((s) => (
            <button
              key={s}
              type="button"
              disabled={isPending}
              onClick={() => advance(s)}
              className="text-xs font-medium bg-white border border-slate-200 hover:border-sky-300 hover:text-sky-700 disabled:opacity-60 text-slate-600 rounded-lg px-3 py-2"
            >
              {STAGE_LABELS[s]}
            </button>
          ))}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-slate-800 mb-2">Notes</h2>
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          rows={3}
          placeholder="Interview notes, follow-up reminders..."
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <button
          type="button"
          disabled={isPending}
          onClick={saveNotes}
          className="mt-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 disabled:opacity-60 text-slate-700 rounded-lg px-3 py-1.5"
        >
          Save Notes
        </button>
      </div>
    </div>
  );
}
