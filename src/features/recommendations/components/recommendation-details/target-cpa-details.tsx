interface TargetCpaDetailsProps {
  details: Record<string, unknown>;
}

function formatMicros(micros: number): string {
  return `$${(micros / 1_000_000).toFixed(2)}`;
}

export function TargetCpaDetails({ details }: TargetCpaDetailsProps) {
  const cpa = details.target_cpa as Record<string, unknown>;
  const cpaMicros = typeof cpa.target_cpa_micros === "number" ? cpa.target_cpa_micros : null;

  if (cpaMicros === null) return null;

  return (
    <div className="space-y-2 text-sm">
      <p>
        <span className="text-muted-foreground">Recommended Target CPA:</span>{" "}
        <span className="font-semibold">{formatMicros(cpaMicros)}</span>
      </p>
    </div>
  );
}
