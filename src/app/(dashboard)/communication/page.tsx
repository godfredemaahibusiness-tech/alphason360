import Link from "next/link";
import { Megaphone, Mail } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export default async function CommunicationPage() {
  const session = await auth();
  const [announcementCount, unreadCount] = await Promise.all([
    prisma.announcement.count({ where: { status: "PUBLISHED" } }),
    prisma.message.count({ where: { recipientId: session!.user.id, readAt: null } }),
  ]);

  const cards = [
    {
      href: "/communication/announcements",
      icon: Megaphone,
      title: "Announcements",
      description: `${announcementCount} published announcements.`,
      tone: "bg-sky-50 text-sky-700",
    },
    {
      href: "/communication/messages",
      icon: Mail,
      title: "Messages",
      description: `${unreadCount} unread in your inbox.`,
      tone: "bg-violet-50 text-violet-700",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Communication</h1>
        <p className="text-sm text-slate-500">Announcements and internal messaging.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="bg-white border border-slate-200 rounded-xl p-5 hover:border-sky-300 transition-colors"
          >
            <div className={`w-10 h-10 rounded-lg ${c.tone} flex items-center justify-center mb-3`}>
              <c.icon size={18} />
            </div>
            <h2 className="text-sm font-semibold text-slate-800">{c.title}</h2>
            <p className="text-xs text-slate-500 mt-1">{c.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
