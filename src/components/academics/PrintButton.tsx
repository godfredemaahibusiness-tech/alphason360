"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden text-sm font-medium bg-sky-700 hover:bg-sky-800 text-white rounded-lg px-4 py-2"
    >
      Print / Save as PDF
    </button>
  );
}
