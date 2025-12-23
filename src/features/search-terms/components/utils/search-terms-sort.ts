export type SortField =
  | "search_term"
  | "impressions"
  | "clicks"
  | "ctr"
  | "cost_micros"
  | "conversions";

export type SortDirection = "asc" | "desc";

function compareStrings(a: string, b: string, direction: SortDirection): number {
  return direction === "asc" ? a.localeCompare(b) : b.localeCompare(a);
}

function compareNumbers(a: number, b: number, direction: SortDirection): number {
  return direction === "asc" ? a - b : b - a;
}

export function createComparator<T>(field: SortField, direction: SortDirection) {
  return (a: T, b: T): number => {
    const aValue = (a as Record<string, unknown>)[field];
    const bValue = (b as Record<string, unknown>)[field];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return compareStrings(aValue, bValue, direction);
    }
    if (typeof aValue === "number" && typeof bValue === "number") {
      return compareNumbers(aValue, bValue, direction);
    }
    return 0;
  };
}
