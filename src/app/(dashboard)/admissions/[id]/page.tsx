import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ApplicantActions } from "@/components/admissions/ApplicantActions";

const STAGE_TONES: Record<string, string> = {
  INQUIRY: "bg-slate-100 text-slate-600",
  APPLIED: "bg-sky-50 text-sky-700",
  INTERVIEW: "bg-violet-50 text-violet-700",
  ACCEPTED: "bg-amber-50 text-amber-700",
  ENROLLED: "bg-emerald-50 text-emerald-700",
  WAITLISTED: "bg-slate-100 text-slate-500",
  REJECTED: "bg-rose-50 text-rose-700",
};

export default async function ApplicantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const applicant = await prisma.applicant.findUnique({
    where: { id },
    include: { enrolledStudent: true },
  });
  if (!applicant) notFound();

  const desiredClass = applicant.desiredClassId
    ? await prisma.schoolClass.findUnique({ where: { id: applicant.desiredClassId } })
    : null;

  return (
    <div className="space-y-4 max-w-2xl">
      <Link href="/admissions" className="text-sm text-sky-700 hover:underline">
        ← Back to Admissions
      </Link>

      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              {applicant.firstName} {applicant.lastName}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Desired class: {desiredClass?.name ?? "Not specified"} · Source: {applicant.source ?? "—"}
            </p>
          </div>
          <span className={`text-xs font-semibold rounded-full px-3 py-1 ${STAGE_TONES[applicant.stage]}`}>
            {applicant.stage}
          </span>
        </div>

        <dl className="grid sm:grid-cols-2 gap-y-1 text-sm mt-4 pt-4 border-t border-slate-100">
          <div>
            <dt className="text-slate-400 text-xs">Parent/Guardian</dt>
            <dd className="text-slate-800">{applicant.parentName}</dd>
          </div>
          <div>
            <dt className="text-slate-400 text-xs">Phone</dt>
            <dd className="text-slate-800">{applicant.parentPhone}</dd>
          </div>
          {applicant.parentEmail && (
            <div>
              <dt className="text-slate-400 text-xs">Email</dt>
              <dd className="text-slate-800">{applicant.parentEmail}</dd>
            </div>
          )}
          <div>
            <dt className="text-slate-400 text-xs">Inquiry date</dt>
            <dd className="text-slate-800">{applicant.createdAt.toLocaleDateString("en-GB")}</dd>
          </div>
        </dl>

        {applicant.enrolledStudent && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <Link
              href={`/students/${applicant.enrolledStudent.id}`}
              className="text-sm text-emerald-700 hover:underline"
            >
              View enrolled student profile ({applicant.enrolledStudent.admissionNumber}) →
            </Link>
          </div>
        )}
      </div>

      {applicant.stage !== "ENROLLED" && applicant.stage !== "REJECTED" && (
        <ApplicantActions id={applicant.id} stage={applicant.stage} notes={applicant.notes} />
      )}
    </div>
  );
}
