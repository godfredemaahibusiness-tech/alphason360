"use client";

import { useState, useTransition, useRef } from "react";
import { createBookAction } from "@/app/(dashboard)/library/actions";

export function NewBookForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createBookAction(formData);
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
      <h2 className="text-sm font-semibold text-slate-800">Add Book</h2>
      <div className="grid sm:grid-cols-4 gap-3">
        <input
          name="title"
          required
          placeholder="Title"
          className="sm:col-span-2 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <input
          name="author"
          required
          placeholder="Author"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <input
          name="category"
          placeholder="Category"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>
      <input
        type="number"
        name="totalCopies"
        min={1}
        defaultValue={2}
        placeholder="Copies"
        className="w-32 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
      />
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="text-sm font-medium bg-sky-700 hover:bg-sky-800 disabled:opacity-60 text-white rounded-lg px-4 py-2"
      >
        {isPending ? "Adding..." : "Add Book"}
      </button>
    </form>
  );
}
