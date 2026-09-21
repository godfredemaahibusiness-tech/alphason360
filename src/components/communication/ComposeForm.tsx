"use client";

import { useState, useTransition } from "react";
import { sendMessageAction } from "@/app/(dashboard)/communication/messages/actions";

export function ComposeForm({
  recipients,
  defaultRecipientId,
  defaultSubject,
}: {
  recipients: { id: string; name: string; role: string }[];
  defaultRecipientId?: string;
  defaultSubject?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await sendMessageAction(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
      <select
        name="recipientId"
        required
        defaultValue={defaultRecipientId ?? ""}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
      >
        <option value="" disabled>
          Select recipient
        </option>
        {recipients.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name} ({r.role})
          </option>
        ))}
      </select>
      <input
        name="subject"
        required
        defaultValue={defaultSubject}
        placeholder="Subject"
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
      />
      <textarea
        name="body"
        required
        rows={4}
        placeholder="Write your message..."
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
      />
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="text-sm font-medium bg-sky-700 hover:bg-sky-800 disabled:opacity-60 text-white rounded-lg px-4 py-2"
      >
        {isPending ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
