import Link from "next/link";
import { notFound } from "next/navigation";
import { getReportCard } from "@/lib/reportCard";
import { SchoolCrest } from "@/components/SchoolCrest";
import { PrintButton } from "@/components/academics/PrintButton";

export default async function ReportCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getReportCard(id, "Term 1");
  if (!data) notFound();

  const { student, enrollment, subjects, overallAverage, attendanceRecords, presentRecords, remark } = data;
  const attendanceRate = attendanceRecords > 0 ? Math.round((presentRecords / attendanceRecords) * 100) : 0;

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between print:hidden">
        <Link href="/academics/report-cards" className="text-sm text-sky-700 hover:underline">
          ← Back to Report Cards
        </Link>
        <PrintButton />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 print:border-none print:shadow-none">
        <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
          <SchoolCrest size={48} />
          <div>
            <h1 className="text-lg font-bold text-slate-900">Alphason International School</h1>
            <p className="text-xs text-slate-500">Oduman, Accra, Ghana</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-sm font-semibold text-slate-800">Term 1 Report Card</p>
            <p className="text-xs text-slate-400">
              {enrollment.academicYear?.name ?? enrollment.academicYearId}
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm py-4 border-b border-slate-100">
          <p>
            <span className="text-slate-400">Student:</span>{" "}
            <span className="font-medium text-slate-800">
              {student.firstName} {student.lastName}
            </span>
          </p>
          <p>
            <span className="text-slate-400">Admission No.:</span>{" "}
            <span className="font-medium text-slate-800">{student.admissionNumber}</span>
          </p>
          <p>
            <span className="text-slate-400">Class:</span>{" "}
            <span className="font-medium text-slate-800">
              {enrollment.class.name}
              {enrollment.section ? ` ${enrollment.section.name}` : ""}
            </span>
          </p>
          <p>
            <span className="text-slate-400">Attendance:</span>{" "}
            <span className="font-medium text-slate-800">
              {presentRecords}/{attendanceRecords} days ({attendanceRate}%)
            </span>
          </p>
        </div>

        <table className="w-full text-sm mt-4">
          <thead className="text-xs uppercase text-slate-400 border-b border-slate-200">
            <tr>
              <th className="text-left py-2 font-medium">Subject</th>
              <th className="text-right py-2 font-medium">Total (%)</th>
              <th className="text-left py-2 font-medium pl-4">Grade</th>
              <th className="text-left py-2 font-medium">Remark</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {subjects.map((s) => (
              <tr key={s.subjectName}>
                <td className="py-2 text-slate-800">{s.subjectName}</td>
                <td className="py-2 text-right font-medium text-slate-800">{s.total}</td>
                <td className="py-2 pl-4">
                  <span className="text-xs font-semibold bg-sky-50 text-sky-700 rounded-full px-2 py-0.5">
                    {s.grade}
                  </span>
                </td>
                <td className="py-2 text-slate-500">{s.remark}</td>
              </tr>
            ))}
            {subjects.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400">
                  No graded assessments yet for this term.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
          <p className="text-sm font-semibold text-slate-800">Overall Average</p>
          <p className="text-lg font-bold text-sky-700">{overallAverage}%</p>
        </div>

        <div className="mt-6 space-y-3 text-sm">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase">Class Teacher&apos;s Comment</p>
            <p className="text-slate-700 mt-0.5">
              {remark?.classTeacherComment ?? "No comment recorded yet."}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase">Headteacher&apos;s Comment</p>
            <p className="text-slate-700 mt-0.5">
              {remark?.headteacherComment ?? "No comment recorded yet."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
