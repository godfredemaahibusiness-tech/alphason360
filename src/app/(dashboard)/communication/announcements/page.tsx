import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { NewAnnouncementForm } from "@/components/communication/NewAnnouncementForm";

const AUDIENCE_LABELS: Record<string, string> = {
  ALL: "Entire school",
  STAFF: "Staff",
  PARENTS: "Parents",
  TEACHERS: "Teachers",
  CLASS: "Class",
};

const STATUS_TONES: Record<string, string> = {
  PUBLISHED: "bg-emerald-50 text-emerald-700",
  DRAFT: "bg-slate-100 text-slate-500",
  ARCHIVED: "bg-slate-100 text-slate-400",
};

export default async function AnnouncementsPage() {
  const [announcements, classes] = await Promise.all([
    prisma.announcement.findMany({
      include: { author: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.schoolClass.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Announcements</h1>
        <p className="text-sm text-slate-500">School-wide and targeted notices.</p>
      </div>

      <NewAnnouncementForm classes={classes} />

      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
        {announcements.map((a) => (
          <Link
            key={a.id}
            href={`/communication/announcements/${a.id}`}
            className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50"
          >
            <div>
              <p className="text-sm font-medium text-slate-800">{a.title}</p>
              <p className="text-xs text-slate-400">
                {AUDIENCE_LABELS[a.audience]} · by {a.author.name} ·{" "}
                {a.createdAt.toLocaleDateString("en-GB")}
              </p>
            </div>
            <span className={`text-xs font-semibold rounded-full px-2.5 py-1 shrink-0 ${STATUS_TONES[a.status]}`}>
              {a.status}
            </span>
          </Link>
        ))}
        {announcements.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-slate-400">No announcements yet.</p>
        )}
      </div>
    </div>
  );
}
