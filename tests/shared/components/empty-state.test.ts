/**
 * Type-level test for consolidated EmptyState component.
 * Verifies that EmptyState accepts both action patterns:
 * - action as ReactNode (legacy components/ui pattern)
 * - action as {label, onClick} object (shared/components pattern)
 * - action omitted entirely
 * - icon omitted (should default)
 */
import type { ComponentProps } from "react";
import type { EmptyState } from "@/shared/components/empty-state";

// Type helper: assert assignability
type AssertAssignable<T, U extends T> = U;

type Props = ComponentProps<typeof EmptyState>;

// Test 1: action as {label, onClick} object should be valid
type _Test1 = AssertAssignable<
  Props,
  {
    title: string;
    description: string;
    action: { label: string; onClick: () => void };
  }
>;

// Test 2: action as ReactNode (JSX element) should be valid
type _Test2 = AssertAssignable<
  Props,
  {
    title: string;
    description: string;
    action: React.ReactNode;
  }
>;

// Test 3: action omitted should be valid
type _Test3 = AssertAssignable<
  Props,
  {
    title: string;
  }
>;

// Test 4: icon omitted should be valid (has default)
type _Test4 = AssertAssignable<
  Props,
  {
    title: string;
    description: string;
  }
>;

// If this file compiles, all type tests pass
export {};
