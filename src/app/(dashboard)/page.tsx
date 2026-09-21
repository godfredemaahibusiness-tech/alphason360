import Link from "next/link";
import { Users, GraduationCap, CalendarCheck, Wallet, ClipboardList } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import {
  AttendanceAreaChart,
  FeeCollectionBarChart,
  PerformanceLineChart,
} from "@/components/dashboard/charts";
import { getDashboardData } from "@/lib/dashboard";
import { formatGHS } from "@/lib/format";

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">School Overview</h1>
          <p className="text-sm text-slate-500">Academic Year {data.currentYearName}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { label: "Add Student", href: "/students" },
            { label: "Record Payment", href: "/finance/invoices" },
            { label: "Take Attendance", href: "/attendance" },
            { label: "Create Announcement", href: "/communication" },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="text-xs font-medium bg-white border border-slate-200 hover:border-sky-300 hover:text-sky-700 text-slate-600 rounded-lg px-3 py-2 transition-colors"
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Students"
          value={data.totalStudents.toString()}
          sublabel={`${data.maleCount} boys · ${data.femaleCount} girls`}
          icon={Users}
          tone="sky"
        />
        <StatCard
          label="Teachers"
          value={data.totalTeachers.toString()}
          sublabel="Teaching staff"
          icon={GraduationCap}
          tone="violet"
        />
        <StatCard
          label="Attendance Today"
          value={`${data.todayAttendanceRate}%`}
          sublabel="Present + late"
          icon={CalendarCheck}
          tone="emerald"
        />
        <StatCard
          label="Fees Collected"
          value={formatGHS(data.totalCollected)}
          sublabel={`${formatGHS(data.outstanding)} outstanding`}
          icon={Wallet}
          tone="amber"
        />
        <StatCard
          label="Admissions"
          value={data.admissionsCount.toString()}
          sublabel="This academic year"
          icon={ClipboardList}
          tone="rose"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-slate-800">Attendance Overview</h2>
            <span className="text-xs text-slate-400">Last 7 school days</span>
          </div>
          <AttendanceAreaChart data={data.attendanceTrend} />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">Upcoming Events</h2>
          <ul className="space-y-3">
            {data.events.map((e) => (
              <li key={e.id} className="flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-700 flex flex-col items-center justify-center text-[10px] font-bold leading-none shrink-0">
                  <span>{e.startDate.getDate()}</span>
                  <span className="text-[8px] font-medium">
                    {e.startDate.toLocaleDateString("en-GB", { month: "short" })}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800 leading-tight">{e.title}</p>
                  <p className="text-xs text-slate-400">{e.description}</p>
                </div>
              </li>
            ))}
            {data.events.length === 0 && (
              <p className="text-sm text-slate-400">No upcoming events.</p>
            )}
          </ul>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-slate-800">Fee Collection</h2>
            <span className="text-xs text-slate-400">Last 6 months</span>
          </div>
          <FeeCollectionBarChart data={data.feeCollectionTrend} />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-slate-800">Academic Performance</h2>
            <span className="text-xs text-slate-400">School-wide average</span>
          </div>
          <PerformanceLineChart data={data.performanceTrend} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">Students by Class</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {data.studentsByClass.map((c) => (
              <div
                key={c.name}
                className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2"
              >
                <span className="text-xs font-medium text-slate-600">{c.name}</span>
                <span className="text-sm font-bold text-slate-900">{c.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">Recent Activity</h2>
          <ul className="space-y-3">
            {data.activity.map((a) => (
              <li key={a.id} className="text-sm">
                <p className="text-slate-700 leading-tight">{a.message}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {a.actorName} · {timeAgo(a.createdAt)}
                </p>
              </li>
            ))}
            {data.activity.length === 0 && (
              <p className="text-sm text-slate-400">No recent activity.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
