export function formatGHS(amount: number) {
  return `GH₵ ${amount.toLocaleString("en-GH", { maximumFractionDigits: 0 })}`;
}
