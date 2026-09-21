"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { returnBookAction } from "@/app/(dashboard)/library/actions";

export function ReturnButton({ borrowRecordId }: { borrowRecordId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await returnBookAction(borrowRecordId);
          router.refresh();
        })
      }
      className="text-xs font-medium bg-slate-100 hover:bg-slate-200 disabled:opacity-60 text-slate-700 rounded-lg px-3 py-1.5"
    >
      Mark Returned
    </button>
  );
}
