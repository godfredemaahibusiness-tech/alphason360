import Link from "next/link";
import { CalendarDays, ClipboardCheck, FileText, BookOpenCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function AcademicsPage() {
  const [classCount, subjectCount, assessmentCount, assignmentCount] = await Promise.all([
    prisma.schoolClass.count(),
    prisma.subject.count(),
    prisma.assessment.count(),
    prisma.assignment.count(),
  ]);

  const cards = [
    {
      href: "/academics/timetable",
      icon: CalendarDays,
      title: "Timetable",
      description: "Weekly class schedules by subject and teacher.",
      tone: "bg-sky-50 text-sky-700",
    },
    {
      href: "/academics/assessments",
      icon: ClipboardCheck,
      title: "Gradebook",
      description: `${assessmentCount} assessments across ${subjectCount} subjects.`,
      tone: "bg-violet-50 text-violet-700",
    },
    {
      href: "/academics/report-cards",
      icon: FileText,
      title: "Report Cards",
      description: "Generate and print Term 1 student report cards.",
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      href: "/academics/assignments",
      icon: BookOpenCheck,
      title: "Assignments",
      description: `${assignmentCount} homework items posted.`,
      tone: "bg-amber-50 text-amber-700",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Academics</h1>
        <p className="text-sm text-slate-500">
          {classCount} classes · {subjectCount} subjects
        </p>
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
