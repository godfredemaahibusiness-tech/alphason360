import { Construction } from "lucide-react";

export function PhasePlaceholder({
  title,
  phase,
  description,
}: {
  title: string;
  phase: number;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center bg-white border border-dashed border-slate-300 rounded-xl py-20 px-6">
      <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-700 flex items-center justify-center mb-4">
        <Construction size={22} />
      </div>
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      <p className="text-sm text-slate-500 mt-1 max-w-md">{description}</p>
      <span className="mt-4 text-xs font-medium bg-slate-100 text-slate-500 rounded-full px-3 py-1">
        Planned for Phase {phase}
      </span>
    </div>
  );
}
