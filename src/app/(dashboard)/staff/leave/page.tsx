import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RequestLeaveForm } from "@/components/staff/RequestLeaveForm";
import { LeaveReviewButtons } from "@/components/staff/LeaveReviewButtons";

const STATUS_TONES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  APPROVED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-rose-50 text-rose-700",
};

export default async function LeaveRequestsPage() {
  const leaveRequests = await prisma.leaveRequest.findMany({
    include: { user: true, reviewedBy: true },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 50,
  });

  return (
    <div className="space-y-4">
      <Link href="/staff" className="text-sm text-sky-700 hover:underline">
        ← Back to Staff
      </Link>

      <div>
        <h1 className="text-xl font-bold text-slate-900">Leave Requests</h1>
        <p className="text-sm text-slate-500">Submit your own leave, or review the school&apos;s queue.</p>
      </div>

      <RequestLeaveForm />

      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
        {leaveRequests.map((l) => (
          <div key={l.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-800">{l.user.name}</p>
              <p className="text-xs text-slate-400">
                {l.type} · {l.startDate.toLocaleDateString("en-GB")} – {l.endDate.toLocaleDateString("en-GB")}
                {l.reviewedBy ? ` · reviewed by ${l.reviewedBy.name}` : ""}
              </p>
              {l.reason && <p className="text-xs text-slate-400 mt-0.5">{l.reason}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${STATUS_TONES[l.status]}`}>
                {l.status}
              </span>
              {l.status === "PENDING" && <LeaveReviewButtons id={l.id} />}
            </div>
          </div>
        ))}
        {leaveRequests.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-slate-400">No leave requests yet.</p>
        )}
      </div>
    </div>
  );
}
