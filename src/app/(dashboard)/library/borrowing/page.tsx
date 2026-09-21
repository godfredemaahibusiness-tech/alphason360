import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ReturnButton } from "@/components/library/ReturnButton";

export default async function BorrowingPage() {
  const records = await prisma.borrowRecord.findMany({
    where: { returnDate: null },
    include: { book: true, student: true },
    orderBy: { dueDate: "asc" },
  });

  const now = new Date();

  return (
    <div className="space-y-4">
      <Link href="/library" className="text-sm text-sky-700 hover:underline">
        ← Back to Library
      </Link>

      <div>
        <h1 className="text-xl font-bold text-slate-900">Active Borrowing</h1>
        <p className="text-sm text-slate-500">{records.length} books currently checked out.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
        {records.map((r) => {
          const overdue = r.dueDate < now;
          return (
            <div key={r.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-800">{r.book.title}</p>
                <p className="text-xs text-slate-400">
                  {r.student.firstName} {r.student.lastName} ({r.student.admissionNumber}) · Due{" "}
                  {r.dueDate.toLocaleDateString("en-GB")}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {overdue && (
                  <span className="text-xs font-semibold bg-rose-50 text-rose-700 rounded-full px-2.5 py-1">
                    Overdue
                  </span>
                )}
                <ReturnButton borrowRecordId={r.id} />
              </div>
            </div>
          );
        })}
        {records.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-slate-400">No books currently borrowed.</p>
        )}
      </div>
    </div>
  );
}
