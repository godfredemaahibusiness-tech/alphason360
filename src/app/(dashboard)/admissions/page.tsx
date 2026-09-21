import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { NewApplicantForm } from "@/components/admissions/NewApplicantForm";
import type { AdmissionStage } from "@prisma/client";

const STAGES: { key: AdmissionStage; label: string }[] = [
  { key: "INQUIRY", label: "Inquiry" },
  { key: "APPLIED", label: "Applied" },
  { key: "INTERVIEW", label: "Interview" },
  { key: "ACCEPTED", label: "Accepted" },
  { key: "ENROLLED", label: "Enrolled" },
  { key: "WAITLISTED", label: "Waitlisted" },
  { key: "REJECTED", label: "Rejected" },
];

const STAGE_TONES: Record<string, string> = {
  INQUIRY: "bg-slate-100 text-slate-600",
  APPLIED: "bg-sky-50 text-sky-700",
  INTERVIEW: "bg-violet-50 text-violet-700",
  ACCEPTED: "bg-amber-50 text-amber-700",
  ENROLLED: "bg-emerald-50 text-emerald-700",
  WAITLISTED: "bg-slate-100 text-slate-500",
  REJECTED: "bg-rose-50 text-rose-700",
};

export default async function AdmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string }>;
}) {
  const params = await searchParams;
  const stageFilter = params.stage as AdmissionStage | undefined;

  const [counts, applicants, classes] = await Promise.all([
    prisma.applicant.groupBy({ by: ["stage"], _count: true }),
    prisma.applicant.findMany({
      where: stageFilter ? { stage: stageFilter } : undefined,
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.schoolClass.findMany({ orderBy: { order: "asc" } }),
  ]);

  const countByStage = Object.fromEntries(counts.map((c) => [c.stage, c._count]));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Admissions</h1>
        <p className="text-sm text-slate-500">Inquiry-to-enrollment pipeline.</p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {STAGES.map((s) => (
          <Link
            key={s.key}
            href={stageFilter === s.key ? "/admissions" : `/admissions?stage=${s.key}`}
            className={`rounded-xl border p-3 text-center transition-colors ${
              stageFilter === s.key ? "border-sky-400 bg-sky-50" : "border-slate-200 bg-white hover:border-sky-300"
            }`}
          >
            <p className="text-lg font-bold text-slate-900">{countByStage[s.key] ?? 0}</p>
            <p className="text-[11px] text-slate-500">{s.label}</p>
          </Link>
        ))}
      </div>

      <NewApplicantForm classes={classes} />

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Child</th>
              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Parent</th>
              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Source</th>
              <th className="text-left px-4 py-3 font-medium">Stage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {applicants.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/admissions/${a.id}`} className="font-medium text-slate-800 hover:text-sky-700">
                    {a.firstName} {a.lastName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">{a.parentName}</td>
                <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{a.source ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${STAGE_TONES[a.stage]}`}>
                    {a.stage}
                  </span>
                </td>
              </tr>
            ))}
            {applicants.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                  No applicants found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
