"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { borrowBookAction } from "@/app/(dashboard)/library/actions";

export function BorrowForm({
  bookId,
  students,
  available,
}: {
  bookId: string;
  students: { id: string; name: string; admissionNumber: string }[];
  available: number;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await borrowBookAction(bookId, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      formRef.current?.reset();
      router.refresh();
    });
  }

  if (available <= 0) {
    return <p className="text-sm text-rose-700 bg-rose-50 rounded-lg px-3 py-2">No copies available right now.</p>;
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-wrap gap-2">
      <select
        name="studentId"
        required
        defaultValue=""
        className="flex-1 min-w-[200px] rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
      >
        <option value="" disabled>
          Select student
        </option>
        {students.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name} ({s.admissionNumber})
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={isPending}
        className="text-sm font-medium bg-sky-700 hover:bg-sky-800 disabled:opacity-60 text-white rounded-lg px-4 py-2"
      >
        {isPending ? "Borrowing..." : "Borrow"}
      </button>
      {error && <p className="w-full text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>}
    </form>
  );
}
