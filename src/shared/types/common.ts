/**
 * Common utility types used across the application
 */

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type AsyncState<T> = {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
};

export type Status = "idle" | "pending" | "success" | "error";

export type WithTimestamps = {
  createdAt: string;
  updatedAt: string;
};

export type WithId<T = string> = {
  id: T;
};

/**
 * Utility type to make specific keys optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Utility type to make specific keys required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
