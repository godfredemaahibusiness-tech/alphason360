import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export default async function MessageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const message = await prisma.message.findUnique({
    where: { id },
    include: { sender: true, recipient: true },
  });
  if (!message || (message.senderId !== userId && message.recipientId !== userId)) notFound();

  if (message.recipientId === userId && !message.readAt) {
    await prisma.message.update({ where: { id }, data: { readAt: new Date() } });
  }

  const isRecipient = message.recipientId === userId;
  const otherParty = isRecipient ? message.sender : message.recipient;

  return (
    <div className="space-y-4 max-w-2xl">
      <Link href="/communication/messages" className="text-sm text-sky-700 hover:underline">
        ← Back to Messages
      </Link>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-slate-900">{message.subject}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {isRecipient ? "From" : "To"} {otherParty.name} ·{" "}
              {message.createdAt.toLocaleString("en-GB")}
            </p>
          </div>
          <Link
            href={`/communication/messages/compose?to=${isRecipient ? message.senderId : message.recipientId}&subject=${encodeURIComponent(
              message.subject.startsWith("Re: ") ? message.subject : `Re: ${message.subject}`
            )}`}
            className="text-xs font-medium bg-sky-700 hover:bg-sky-800 text-white rounded-lg px-3 py-2 shrink-0"
          >
            Reply
          </Link>
        </div>
        <p className="text-sm text-slate-700 mt-4 whitespace-pre-wrap">{message.body}</p>
      </div>
    </div>
  );
}
