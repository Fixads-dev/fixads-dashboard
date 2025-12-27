"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type DateRangeValue = "LAST_7_DAYS" | "LAST_14_DAYS" | "LAST_30_DAYS" | "LAST_90_DAYS";

interface DateRangeSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

const DATE_RANGE_OPTIONS: { value: DateRangeValue; label: string }[] = [
  { value: "LAST_7_DAYS", label: "Last 7 days" },
  { value: "LAST_14_DAYS", label: "Last 14 days" },
  { value: "LAST_30_DAYS", label: "Last 30 days" },
  { value: "LAST_90_DAYS", label: "Last 90 days" },
];

export function DateRangeSelect({
  value,
  onValueChange,
  className,
}: DateRangeSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={cn("w-[180px]", className)}>
        <SelectValue placeholder="Select date range" />
      </SelectTrigger>
      <SelectContent>
        {DATE_RANGE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
