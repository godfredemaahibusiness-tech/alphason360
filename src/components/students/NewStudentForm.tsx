"use client";

import { useState, useTransition, useRef } from "react";
import { createStudentAction } from "@/app/(dashboard)/students/actions";

export function NewStudentForm({ classes }: { classes: { id: string; name: string }[] }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createStudentAction(formData);
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
      <h2 className="text-sm font-semibold text-slate-800">Add Student</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          name="firstName"
          required
          placeholder="First name"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <input
          name="lastName"
          required
          placeholder="Last name"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <select
          name="gender"
          required
          defaultValue=""
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="" disabled>
            Gender
          </option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
        </select>
        <input
          name="dateOfBirth"
          type="date"
          required
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <select
          name="classId"
          required
          defaultValue=""
          className="sm:col-span-2 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="" disabled>
            Class
          </option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          name="guardianName"
          required
          placeholder="Guardian name"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <select
          name="guardianRelationship"
          defaultValue="Parent"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="Mother">Mother</option>
          <option value="Father">Father</option>
          <option value="Parent">Parent</option>
          <option value="Guardian">Guardian</option>
        </select>
        <input
          name="guardianPhone"
          required
          placeholder="Guardian phone"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <input
          name="guardianEmail"
          type="email"
          placeholder="Guardian email (optional)"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="text-sm font-medium bg-sky-700 hover:bg-sky-800 disabled:opacity-60 text-white rounded-lg px-4 py-2"
      >
        {isPending ? "Adding..." : "Add Student"}
      </button>
    </form>
  );
}
