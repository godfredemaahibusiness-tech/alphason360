import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { NewBookForm } from "@/components/library/NewBookForm";

export default async function LibraryPage() {
  const [books, activeBorrows, overdueCount] = await Promise.all([
    prisma.book.findMany({ orderBy: { title: "asc" } }),
    prisma.borrowRecord.count({ where: { returnDate: null } }),
    prisma.borrowRecord.count({ where: { returnDate: null, dueDate: { lt: new Date() } } }),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Library</h1>
          <p className="text-sm text-slate-500">{books.length} titles in the catalogue.</p>
        </div>
        <Link
          href="/library/borrowing"
          className="text-sm font-medium bg-sky-700 hover:bg-sky-800 text-white rounded-lg px-4 py-2"
        >
          Borrowing ({activeBorrows})
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-400">Titles</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{books.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-400">Active Borrows</p>
          <p className="text-xl font-bold text-sky-700 mt-1">{activeBorrows}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-400">Overdue</p>
          <p className="text-xl font-bold text-rose-700 mt-1">{overdueCount}</p>
        </div>
      </div>

      <NewBookForm />

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Title</th>
              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Author</th>
              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Category</th>
              <th className="text-left px-4 py-3 font-medium">Available</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {books.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/library/books/${b.id}`} className="font-medium text-slate-800 hover:text-sky-700">
                    {b.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">{b.author}</td>
                <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{b.category ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-semibold rounded-full px-2.5 py-1 ${
                      b.availableCopies > 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {b.availableCopies}/{b.totalCopies}
                  </span>
                </td>
              </tr>
            ))}
            {books.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                  No books in the catalogue yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
