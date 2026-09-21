import { ROLE_LABELS } from "@/lib/roles";
import { signOutAction } from "@/app/(dashboard)/sign-out-action";
import { NotificationBell } from "@/components/NotificationBell";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export async function Topbar({ userId, name, role }: { userId: string; name: string; role: Role }) {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 15,
  });
  const notificationItems = notifications.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    link: n.link,
    isRead: n.isRead,
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 sm:px-6 border-b border-slate-200 bg-white/80 backdrop-blur print:hidden">
      <div>
        <p className="text-xs text-slate-400 leading-none">{greeting()}</p>
        <p className="text-sm font-semibold text-slate-900 mt-0.5">{name}</p>
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell notifications={notificationItems} />

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-sky-700 text-white text-xs font-semibold flex items-center justify-center">
            {name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")}
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="text-sm font-medium text-slate-900">{name}</p>
            <p className="text-xs text-slate-400">{ROLE_LABELS[role]}</p>
          </div>
        </div>

        <form action={signOutAction}>
          <button
            type="submit"
            className="text-xs font-medium text-slate-500 hover:text-slate-800 border border-slate-200 rounded-md px-2.5 py-1.5"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
