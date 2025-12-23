interface KeywordDetailsProps {
  details: Record<string, unknown>;
}

function formatMicros(micros: number): string {
  return `$${(micros / 1_000_000).toFixed(2)}`;
}

export function KeywordDetails({ details }: KeywordDetailsProps) {
  const kw = details.keyword as Record<string, unknown>;
  const text = typeof kw.text === "string" ? kw.text : null;
  const matchType = typeof kw.match_type === "string" ? kw.match_type : null;
  const bidMicros = typeof kw.cpc_bid_micros === "number" ? kw.cpc_bid_micros : null;

  return (
    <div className="space-y-2 text-sm">
      {text && (
        <p>
          <span className="text-muted-foreground">Keyword:</span>{" "}
          <span className="font-mono bg-muted px-1 rounded">{text}</span>
        </p>
      )}
      {matchType && (
        <p>
          <span className="text-muted-foreground">Match Type:</span> {matchType}
        </p>
      )}
      {bidMicros && (
        <p>
          <span className="text-muted-foreground">Recommended Bid:</span> {formatMicros(bidMicros)}
        </p>
      )}
    </div>
  );
}
