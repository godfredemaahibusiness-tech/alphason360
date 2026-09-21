"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeStudentFromRouteAction } from "@/app/(dashboard)/transport/actions";

export function RemoveStudentButton({ studentId, routeId }: { studentId: string; routeId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await removeStudentFromRouteAction(studentId, routeId);
          router.refresh();
        })
      }
      className="text-xs font-medium text-slate-400 hover:text-rose-600 disabled:opacity-50"
    >
      Remove
    </button>
  );
}
