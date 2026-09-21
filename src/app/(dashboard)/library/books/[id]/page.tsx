import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BorrowForm } from "@/components/library/BorrowForm";
import { ReturnButton } from "@/components/library/ReturnButton";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [book, students] = await Promise.all([
    prisma.book.findUnique({
      where: { id },
      include: {
        borrowRecords: {
          include: { student: true },
          orderBy: { borrowDate: "desc" },
          take: 20,
        },
      },
    }),
    prisma.student.findMany({
      where: { status: "ACTIVE" },
      orderBy: { lastName: "asc" },
      select: { id: true, firstName: true, lastName: true, admissionNumber: true },
    }),
  ]);
  if (!book) notFound();

  const studentOptions = students.map((s) => ({
    id: s.id,
    name: `${s.firstName} ${s.lastName}`,
    admissionNumber: s.admissionNumber,
  }));

  return (
    <div className="space-y-4 max-w-2xl">
      <Link href="/library" className="text-sm text-sky-700 hover:underline">
        ← Back to Library
      </Link>

      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h1 className="text-lg font-bold text-slate-900">{book.title}</h1>
        <p className="text-sm text-slate-500">
          {book.author} {book.category ? `· ${book.category}` : ""}
        </p>
        <p className="text-sm text-slate-600 mt-2">
          {book.availableCopies} of {book.totalCopies} copies available
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">Borrow This Book</h2>
        <BorrowForm bookId={book.id} students={studentOptions} available={book.availableCopies} />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">Borrowing History</h2>
        <div className="divide-y divide-slate-100">
          {book.borrowRecords.map((r) => {
            const overdue = !r.returnDate && r.dueDate < new Date();
            return (
              <div key={r.id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <p className="text-slate-700">
                    {r.student.firstName} {r.student.lastName}
                  </p>
                  <p className="text-xs text-slate-400">
                    Borrowed {r.borrowDate.toLocaleDateString("en-GB")} · Due {r.dueDate.toLocaleDateString("en-GB")}
                  </p>
                </div>
                {r.returnDate ? (
                  <span className="text-xs font-semibold bg-slate-100 text-slate-500 rounded-full px-2.5 py-1">
                    Returned {r.returnDate.toLocaleDateString("en-GB")}
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    {overdue && (
                      <span className="text-xs font-semibold bg-rose-50 text-rose-700 rounded-full px-2.5 py-1">
                        Overdue
                      </span>
                    )}
                    <ReturnButton borrowRecordId={r.id} />
                  </div>
                )}
              </div>
            );
          })}
          {book.borrowRecords.length === 0 && (
            <p className="py-6 text-center text-sm text-slate-400">No borrowing history.</p>
          )}
        </div>
      </div>
    </div>
  );
}
