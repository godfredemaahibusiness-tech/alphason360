"use client";

import { useState, useTransition, useRef } from "react";
import { requestLeaveAction } from "@/app/(dashboard)/staff/leave/actions";

export function RequestLeaveForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await requestLeaveAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      formRef.current?.reset();
    });
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="bg-white border border-slate-200 rounded-xl p-4 space-y-3"
    >
      <h2 className="text-sm font-semibold text-slate-800">Request Leave</h2>
      <div className="grid sm:grid-cols-3 gap-3">
        <select
          name="type"
          defaultValue="ANNUAL"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="ANNUAL">Annual</option>
          <option value="SICK">Sick</option>
          <option value="MATERNITY">Maternity</option>
          <option value="PATERNITY">Paternity</option>
          <option value="EMERGENCY">Emergency</option>
          <option value="OTHER">Other</option>
        </select>
        <input
          type="date"
          name="startDate"
          required
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <input
          type="date"
          name="endDate"
          required
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>
      <textarea
        name="reason"
        rows={2}
        placeholder="Reason (optional)"
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
      />
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="text-sm font-medium bg-sky-700 hover:bg-sky-800 disabled:opacity-60 text-white rounded-lg px-4 py-2"
      >
        {isPending ? "Submitting..." : "Submit Request"}
      </button>
    </form>
  );
}
