"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { clockInAction, clockOutAction } from "@/app/(dashboard)/staff/attendance/actions";

export function ClockInOut({
  clockIn,
  clockOut,
}: {
  clockIn: string | null;
  clockOut: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handle(action: () => Promise<void>) {
    startTransition(async () => {
      await action();
      router.refresh();
    });
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
      <div className="text-sm text-slate-600">
        {clockIn ? (
          <>
            Clocked in at <span className="font-medium text-slate-800">{clockIn}</span>
            {clockOut && (
              <>
                {" "}
                · clocked out at <span className="font-medium text-slate-800">{clockOut}</span>
              </>
            )}
          </>
        ) : (
          "You haven't clocked in today."
        )}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={isPending || !!clockIn}
          onClick={() => handle(clockInAction)}
          className="text-xs font-medium bg-sky-700 hover:bg-sky-800 disabled:opacity-40 text-white rounded-lg px-3 py-2"
        >
          Clock In
        </button>
        <button
          type="button"
          disabled={isPending || !clockIn || !!clockOut}
          onClick={() => handle(clockOutAction)}
          className="text-xs font-medium bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-lg px-3 py-2"
        >
          Clock Out
        </button>
      </div>
    </div>
  );
}
