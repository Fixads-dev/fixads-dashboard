import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  useIsDesktop,
  useIsMobile,
  useIsTablet,
  useMediaQuery,
} from "@/shared/hooks/use-media-query";

describe("useMediaQuery hook", () => {
  let mockMatchMedia: ReturnType<typeof vi.fn>;
  let mockAddEventListener: ReturnType<typeof vi.fn>;
  let mockRemoveEventListener: ReturnType<typeof vi.fn>;
  let changeHandler: ((event: MediaQueryListEvent) => void) | null = null;

  beforeEach(() => {
    mockAddEventListener = vi.fn((event, handler) => {
      if (event === "change") {
        changeHandler = handler;
      }
    });
    mockRemoveEventListener = vi.fn();

    mockMatchMedia = vi.fn((query: string) => ({
      matches: false,
      media: query,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: mockMatchMedia,
    });
  });

  afterEach(() => {
    changeHandler = null;
    vi.restoreAllMocks();
  });

  it("returns false initially", () => {
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(false);
  });

  it("returns true when media query matches", () => {
    mockMatchMedia.mockReturnValue({
      matches: true,
      media: "(min-width: 768px)",
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });

    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(true);
  });

  it("calls matchMedia with the correct query", () => {
    renderHook(() => useMediaQuery("(min-width: 1024px)"));
    expect(mockMatchMedia).toHaveBeenCalledWith("(min-width: 1024px)");
  });

  it("adds change event listener", () => {
    renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(mockAddEventListener).toHaveBeenCalledWith("change", expect.any(Function));
  });

  it("removes event listener on unmount", () => {
    const { unmount } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    unmount();
    expect(mockRemoveEventListener).toHaveBeenCalledWith("change", expect.any(Function));
  });

  it("updates when media query changes", () => {
    mockMatchMedia.mockReturnValue({
      matches: false,
      media: "(min-width: 768px)",
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });

    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(false);

    act(() => {
      if (changeHandler) {
        changeHandler({ matches: true } as MediaQueryListEvent);
      }
    });

    expect(result.current).toBe(true);
  });

  it("re-subscribes when query changes", () => {
    const { rerender } = renderHook(({ query }) => useMediaQuery(query), {
      initialProps: { query: "(min-width: 768px)" },
    });

    expect(mockMatchMedia).toHaveBeenCalledWith("(min-width: 768px)");

    rerender({ query: "(min-width: 1024px)" });

    expect(mockMatchMedia).toHaveBeenCalledWith("(min-width: 1024px)");
    expect(mockRemoveEventListener).toHaveBeenCalled();
  });

  describe("useIsMobile", () => {
    it("uses correct mobile breakpoint", () => {
      renderHook(() => useIsMobile());
      expect(mockMatchMedia).toHaveBeenCalledWith("(max-width: 767px)");
    });

    it("returns true when viewport is mobile width", () => {
      mockMatchMedia.mockReturnValue({
        matches: true,
        media: "(max-width: 767px)",
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(true);
    });
  });

  describe("useIsTablet", () => {
    it("uses correct tablet breakpoint", () => {
      renderHook(() => useIsTablet());
      expect(mockMatchMedia).toHaveBeenCalledWith("(min-width: 768px) and (max-width: 1023px)");
    });

    it("returns true when viewport is tablet width", () => {
      mockMatchMedia.mockReturnValue({
        matches: true,
        media: "(min-width: 768px) and (max-width: 1023px)",
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      const { result } = renderHook(() => useIsTablet());
      expect(result.current).toBe(true);
    });
  });

  describe("useIsDesktop", () => {
    it("uses correct desktop breakpoint", () => {
      renderHook(() => useIsDesktop());
      expect(mockMatchMedia).toHaveBeenCalledWith("(min-width: 1024px)");
    });

    it("returns true when viewport is desktop width", () => {
      mockMatchMedia.mockReturnValue({
        matches: true,
        media: "(min-width: 1024px)",
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      const { result } = renderHook(() => useIsDesktop());
      expect(result.current).toBe(true);
    });
  });
});
