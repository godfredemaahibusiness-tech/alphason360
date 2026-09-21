"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const AXIS_STYLE = { fontSize: 11, fill: "#94a3b8" };

export function AttendanceAreaChart({ data }: { data: { day: string; rate: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="attendanceFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0369a1" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#0369a1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="day" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
        <YAxis
          domain={[70, 100]}
          tick={AXIS_STYLE}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip formatter={(value) => [`${value}%`, "Attendance"]} />
        <Area
          type="monotone"
          dataKey="rate"
          stroke="#0369a1"
          strokeWidth={2}
          fill="url(#attendanceFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function FeeCollectionBarChart({ data }: { data: { month: string; amount: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="month" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
        <YAxis
          tick={AXIS_STYLE}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip formatter={(value) => [`GHS ${Number(value).toLocaleString()}`, "Collected"]} />
        <Bar dataKey="amount" fill="#0ea5e9" radius={[6, 6, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PerformanceLineChart({ data }: { data: { term: string; average: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="term" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
        <YAxis
          domain={[50, 100]}
          tick={AXIS_STYLE}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip formatter={(value) => [`${value}%`, "School average"]} />
        <Line
          type="monotone"
          dataKey="average"
          stroke="#7c3aed"
          strokeWidth={2.5}
          dot={{ r: 4, fill: "#7c3aed" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
