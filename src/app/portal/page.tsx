import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SchoolCrest } from "@/components/SchoolCrest";
import { ROLE_LABELS } from "@/lib/roles";
import { signOutAction } from "@/app/(dashboard)/sign-out-action";
import { NotificationBell } from "@/components/NotificationBell";
import { getRelevantAnnouncements } from "@/lib/portalCommunication";

const AUDIENCE_LABELS: Record<string, string> = {
  ALL: "Entire school",
  STAFF: "Staff",
  PARENTS: "Parents",
  TEACHERS: "Teachers",
  CLASS: "Your class",
};

export default async function PortalPage() {
  const session = await auth();
  const user = session!.user;

  const [announcements, messages, notifications] = await Promise.all([
    getRelevantAnnouncements(user.id, user.role),
    prisma.message.findMany({
      where: { recipientId: user.id },
      include: { sender: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
  ]);

  const notificationItems = notifications.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    link: n.link,
    isRead: n.isRead,
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between px-4 sm:px-6 h-16 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          <SchoolCrest size={32} />
          <div className="leading-tight">
            <p className="text-sm font-bold text-slate-900">ALPHASON INT. SCHOOL</p>
            <p className="text-xs text-slate-400">{ROLE_LABELS[user.role]} Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell notifications={notificationItems} />
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

      <main className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Welcome, {user.name}</h1>
          <p className="text-sm text-slate-500">
            This prototype&apos;s full dashboard is administrator-only for now — announcements and
            messaging are live for every role.
          </p>
        </div>

        <section className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-800">Announcements</h2>
          </div>
          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.id} className="border-b border-slate-100 last:border-0 pb-3 last:pb-0">
                <p className="text-sm font-medium text-slate-800">{a.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{a.description}</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {AUDIENCE_LABELS[a.audience]} · {a.author.name} ·{" "}
                  {a.publishDate.toLocaleDateString("en-GB")}
                </p>
              </div>
            ))}
            {announcements.length === 0 && (
              <p className="text-sm text-slate-400">No announcements for you right now.</p>
            )}
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-800">Recent Messages</h2>
            <Link href="/communication/messages/compose" className="text-xs text-sky-700 hover:underline">
              New message
            </Link>
          </div>
          <div className="space-y-3">
            {messages.map((m) => (
              <Link
                key={m.id}
                href={`/communication/messages/${m.id}`}
                className="flex items-center justify-between gap-3 border-b border-slate-100 last:border-0 pb-3 last:pb-0"
              >
                <div>
                  <p className={`text-sm ${!m.readAt ? "font-semibold text-slate-900" : "font-medium text-slate-700"}`}>
                    {m.subject}
                  </p>
                  <p className="text-xs text-slate-400">From {m.sender.name}</p>
                </div>
                {!m.readAt && <span className="w-2 h-2 rounded-full bg-sky-600 shrink-0" />}
              </Link>
            ))}
            {messages.length === 0 && (
              <p className="text-sm text-slate-400">No messages yet.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
