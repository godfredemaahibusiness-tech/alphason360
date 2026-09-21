"use client";

import { useTransition } from "react";
import { deleteFeeItemAction } from "@/app/(dashboard)/finance/fee-structure/actions";

export function DeleteFeeItemButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (confirm("Remove this fee item?")) {
          startTransition(() => deleteFeeItemAction(id));
        }
      }}
      className="text-xs font-medium text-slate-400 hover:text-rose-600 disabled:opacity-50"
    >
      Remove
    </button>
  );
}
