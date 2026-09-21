import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AnnouncementStatusButtons } from "@/components/communication/AnnouncementStatusButtons";

const AUDIENCE_LABELS: Record<string, string> = {
  ALL: "Entire school",
  STAFF: "Staff",
  PARENTS: "Parents",
  TEACHERS: "Teachers",
  CLASS: "Class",
};

export default async function AnnouncementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const announcement = await prisma.announcement.findUnique({
    where: { id },
    include: { author: true },
  });
  if (!announcement) notFound();

  const targetClass = announcement.classId
    ? await prisma.schoolClass.findUnique({ where: { id: announcement.classId } })
    : null;

  return (
    <div className="space-y-4 max-w-2xl">
      <Link href="/communication/announcements" className="text-sm text-sky-700 hover:underline">
        ← Back to Announcements
      </Link>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-slate-900">{announcement.title}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {AUDIENCE_LABELS[announcement.audience]}
              {targetClass ? ` — ${targetClass.name}` : ""} · by {announcement.author.name}
            </p>
          </div>
          <AnnouncementStatusButtons id={announcement.id} status={announcement.status} />
        </div>
        <p className="text-sm text-slate-700 mt-4 whitespace-pre-wrap">{announcement.description}</p>
        <p className="text-xs text-slate-400 mt-6">
          Created {announcement.createdAt.toLocaleString("en-GB")}
        </p>
      </div>
    </div>
  );
}
