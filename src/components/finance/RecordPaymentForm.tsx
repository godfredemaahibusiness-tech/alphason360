"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { recordPaymentAction } from "@/app/(dashboard)/finance/invoices/actions";

export function RecordPaymentForm({ invoiceId, balance }: { invoiceId: string; balance: number }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await recordPaymentAction(invoiceId, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      formRef.current?.reset();
      router.refresh();
    });
  }

  if (balance <= 0) {
    return (
      <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
        This invoice is fully paid.
      </p>
    );
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-3">
      <div className="grid sm:grid-cols-3 gap-3">
        <input
          type="number"
          name="amount"
          required
          min={1}
          max={balance}
          step="0.01"
          defaultValue={balance}
          placeholder="Amount (GH₵)"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <select
          name="method"
          defaultValue="Mobile Money"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option>Mobile Money</option>
          <option>Cash</option>
          <option>Bank Transfer</option>
          <option>Card</option>
        </select>
        <input
          name="transactionId"
          placeholder="Transaction ID (optional)"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="text-sm font-medium bg-sky-700 hover:bg-sky-800 disabled:opacity-60 text-white rounded-lg px-4 py-2"
      >
        {isPending ? "Recording..." : "Record Payment"}
      </button>
    </form>
  );
}
