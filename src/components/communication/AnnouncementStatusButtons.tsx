"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setAnnouncementStatusAction } from "@/app/(dashboard)/communication/announcements/actions";

export function AnnouncementStatusButtons({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function set(next: "PUBLISHED" | "ARCHIVED" | "DRAFT") {
    startTransition(async () => {
      await setAnnouncementStatusAction(id, next);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      {status !== "PUBLISHED" && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => set("PUBLISHED")}
          className="text-xs font-medium bg-sky-700 hover:bg-sky-800 disabled:opacity-60 text-white rounded-lg px-3 py-2"
        >
          Publish
        </button>
      )}
      {status !== "ARCHIVED" && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => set("ARCHIVED")}
          className="text-xs font-medium bg-slate-100 hover:bg-slate-200 disabled:opacity-60 text-slate-700 rounded-lg px-3 py-2"
        >
          Archive
        </button>
      )}
    </div>
  );
}
