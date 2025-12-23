interface GenericDetailsProps {
  details: Record<string, unknown>;
}

export function GenericDetails({ details }: GenericDetailsProps) {
  if (Object.keys(details).length === 0) {
    return <p className="text-sm text-muted-foreground">No additional details available.</p>;
  }

  return (
    <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
      {JSON.stringify(details, null, 2)}
    </pre>
  );
}
