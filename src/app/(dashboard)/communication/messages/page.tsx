import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab === "sent" ? "sent" : "inbox";
  const session = await auth();
  const userId = session!.user.id;

  const messages = await prisma.message.findMany({
    where: tab === "inbox" ? { recipientId: userId } : { senderId: userId },
    include: { sender: true, recipient: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Messages</h1>
          <p className="text-sm text-slate-500">Internal messaging between staff, teachers, and parents.</p>
        </div>
        <Link
          href="/communication/messages/compose"
          className="text-sm font-medium bg-sky-700 hover:bg-sky-800 text-white rounded-lg px-4 py-2"
        >
          Compose
        </Link>
      </div>

      <div className="flex gap-2">
        <Link
          href="/communication/messages?tab=inbox"
          className={`text-xs font-medium rounded-lg px-3 py-1.5 ${
            tab === "inbox" ? "bg-sky-700 text-white" : "bg-white border border-slate-200 text-slate-600"
          }`}
        >
          Inbox
        </Link>
        <Link
          href="/communication/messages?tab=sent"
          className={`text-xs font-medium rounded-lg px-3 py-1.5 ${
            tab === "sent" ? "bg-sky-700 text-white" : "bg-white border border-slate-200 text-slate-600"
          }`}
        >
          Sent
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
        {messages.map((m) => (
          <Link
            key={m.id}
            href={`/communication/messages/${m.id}`}
            className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50"
          >
            <div>
              <p className={`text-sm ${!m.readAt && tab === "inbox" ? "font-semibold text-slate-900" : "font-medium text-slate-700"}`}>
                {m.subject}
              </p>
              <p className="text-xs text-slate-400">
                {tab === "inbox" ? `From ${m.sender.name}` : `To ${m.recipient.name}`}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!m.readAt && tab === "inbox" && (
                <span className="w-2 h-2 rounded-full bg-sky-600" />
              )}
              <span className="text-xs text-slate-400">{m.createdAt.toLocaleDateString("en-GB")}</span>
            </div>
          </Link>
        ))}
        {messages.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-slate-400">
            {tab === "inbox" ? "No messages received yet." : "No messages sent yet."}
          </p>
        )}
      </div>
    </div>
  );
}
