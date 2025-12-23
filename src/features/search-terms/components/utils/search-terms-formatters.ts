export function formatCost(micros: number): string {
  return `$${(micros / 1_000_000).toFixed(2)}`;
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}
