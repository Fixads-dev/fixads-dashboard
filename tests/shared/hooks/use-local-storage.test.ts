import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLocalStorage } from "@/shared/hooks/use-local-storage";

describe("useLocalStorage hook", () => {
  const mockLocalStorage: Record<string, string> = {};

  beforeEach(() => {
    Object.keys(mockLocalStorage).forEach((key) => delete mockLocalStorage[key]);

    vi.spyOn(Storage.prototype, "getItem").mockImplementation((key) => {
      return mockLocalStorage[key] ?? null;
    });

    vi.spyOn(Storage.prototype, "setItem").mockImplementation((key, value) => {
      mockLocalStorage[key] = value;
    });

    vi.spyOn(Storage.prototype, "removeItem").mockImplementation((key) => {
      delete mockLocalStorage[key];
    });

    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns initial value when localStorage is empty", () => {
    const { result } = renderHook(() => useLocalStorage("testKey", "initial"));
    expect(result.current[0]).toBe("initial");
  });

  it("returns stored value from localStorage", () => {
    mockLocalStorage["testKey"] = JSON.stringify("stored");

    const { result } = renderHook(() => useLocalStorage("testKey", "initial"));
    expect(result.current[0]).toBe("stored");
  });

  it("sets value in localStorage", () => {
    const { result } = renderHook(() => useLocalStorage("testKey", "initial"));

    act(() => {
      result.current[1]("newValue");
    });

    expect(result.current[0]).toBe("newValue");
    expect(mockLocalStorage["testKey"]).toBe(JSON.stringify("newValue"));
  });

  it("supports functional updates", () => {
    const { result } = renderHook(() => useLocalStorage("counter", 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);

    act(() => {
      result.current[1]((prev) => prev + 10);
    });

    expect(result.current[0]).toBe(11);
  });

  it("removes value from localStorage", () => {
    mockLocalStorage["testKey"] = JSON.stringify("stored");

    const { result } = renderHook(() => useLocalStorage("testKey", "initial"));

    act(() => {
      result.current[2]();
    });

    expect(result.current[0]).toBe("initial");
    expect(mockLocalStorage["testKey"]).toBeUndefined();
  });

  it("works with object values", () => {
    const initialObj = { name: "test", count: 0 };

    const { result } = renderHook(() => useLocalStorage("objKey", initialObj));

    expect(result.current[0]).toEqual(initialObj);

    const newObj = { name: "updated", count: 5 };
    act(() => {
      result.current[1](newObj);
    });

    expect(result.current[0]).toEqual(newObj);
    expect(JSON.parse(mockLocalStorage["objKey"])).toEqual(newObj);
  });

  it("works with array values", () => {
    const initialArr = [1, 2, 3];

    const { result } = renderHook(() => useLocalStorage("arrKey", initialArr));

    act(() => {
      result.current[1]([...initialArr, 4, 5]);
    });

    expect(result.current[0]).toEqual([1, 2, 3, 4, 5]);
  });

  it("works with boolean values", () => {
    const { result } = renderHook(() => useLocalStorage("boolKey", false));

    expect(result.current[0]).toBe(false);

    act(() => {
      result.current[1](true);
    });

    expect(result.current[0]).toBe(true);
  });

  it("works with null values", () => {
    const { result } = renderHook(() => useLocalStorage<string | null>("nullKey", null));

    expect(result.current[0]).toBeNull();

    act(() => {
      result.current[1]("notNull");
    });

    expect(result.current[0]).toBe("notNull");

    act(() => {
      result.current[1](null);
    });

    expect(result.current[0]).toBeNull();
  });

  it("handles JSON parse error gracefully", () => {
    mockLocalStorage["badKey"] = "invalid json {";

    const { result } = renderHook(() => useLocalStorage("badKey", "fallback"));

    expect(result.current[0]).toBe("fallback");
    expect(console.warn).toHaveBeenCalled();
  });

  it("handles localStorage setItem error gracefully", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    const { result } = renderHook(() => useLocalStorage("errorKey", "initial"));

    act(() => {
      result.current[1]("newValue");
    });

    expect(result.current[0]).toBe("initial");
    expect(console.warn).toHaveBeenCalled();
  });

  it("handles localStorage removeItem error gracefully", () => {
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });

    const { result } = renderHook(() => useLocalStorage("errorKey", "initial"));

    act(() => {
      result.current[2]();
    });

    expect(result.current[0]).toBe("initial");
    expect(console.warn).toHaveBeenCalled();
  });

  it("uses different keys independently", () => {
    const { result: result1 } = renderHook(() => useLocalStorage("key1", "value1"));
    const { result: result2 } = renderHook(() => useLocalStorage("key2", "value2"));

    act(() => {
      result1.current[1]("updated1");
    });

    expect(result1.current[0]).toBe("updated1");
    expect(result2.current[0]).toBe("value2");
  });

  it("maintains stable setValue and removeValue references", () => {
    const { result, rerender } = renderHook(() => useLocalStorage("stableKey", "initial"));

    const setValue1 = result.current[1];
    const removeValue1 = result.current[2];

    rerender();

    expect(result.current[1]).toBe(setValue1);
    expect(result.current[2]).toBe(removeValue1);
  });
});
