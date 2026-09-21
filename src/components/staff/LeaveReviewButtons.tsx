"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { reviewLeaveAction } from "@/app/(dashboard)/staff/leave/actions";

export function LeaveReviewButtons({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function review(status: "APPROVED" | "REJECTED") {
    startTransition(async () => {
      await reviewLeaveAction(id, status);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-1.5">
      <button
        type="button"
        disabled={isPending}
        onClick={() => review("APPROVED")}
        className="text-xs font-medium bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-lg px-2.5 py-1.5"
      >
        Approve
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => review("REJECTED")}
        className="text-xs font-medium bg-rose-50 hover:bg-rose-100 disabled:opacity-60 text-rose-700 rounded-lg px-2.5 py-1.5"
      >
        Reject
      </button>
    </div>
  );
}
