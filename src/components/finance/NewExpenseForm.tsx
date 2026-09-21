"use client";

import { useState, useTransition, useRef } from "react";
import { createExpenseAction } from "@/app/(dashboard)/finance/expenses/actions";

const CATEGORIES = ["Salaries", "Utilities", "Supplies", "Maintenance", "Transport", "Other"];

export function NewExpenseForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createExpenseAction(formData);
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
      <h2 className="text-sm font-semibold text-slate-800">Record Expense</h2>
      <div className="grid sm:grid-cols-4 gap-3">
        <select
          name="category"
          defaultValue=""
          required
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="" disabled>
            Category
          </option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          type="number"
          name="amount"
          required
          min={1}
          step="0.01"
          placeholder="Amount (GH₵)"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <input
          type="date"
          name="date"
          required
          defaultValue={new Date().toISOString().slice(0, 10)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <input
          name="description"
          placeholder="Description (optional)"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="text-sm font-medium bg-sky-700 hover:bg-sky-800 disabled:opacity-60 text-white rounded-lg px-4 py-2"
      >
        {isPending ? "Saving..." : "Add Expense"}
      </button>
    </form>
  );
}
