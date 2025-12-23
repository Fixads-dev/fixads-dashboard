import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CircuitBreaker, CircuitBreakerOpenError } from "@/shared/lib/circuit-breaker";

describe("CircuitBreaker", () => {
  let circuitBreaker: CircuitBreaker;

  beforeEach(() => {
    vi.useFakeTimers();
    circuitBreaker = new CircuitBreaker({
      failureThreshold: 3,
      resetTimeout: 10000,
      halfOpenMaxCalls: 2,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("initial state", () => {
    it("starts in CLOSED state", () => {
      const stats = circuitBreaker.getStats();
      expect(stats.state).toBe("CLOSED");
      expect(stats.failureCount).toBe(0);
      expect(stats.successCount).toBe(0);
    });

    it("allows execution in CLOSED state", () => {
      expect(circuitBreaker.canExecute()).toBe(true);
    });
  });

  describe("default options", () => {
    it("uses default values when no options provided", () => {
      const defaultBreaker = new CircuitBreaker();
      // Record 5 failures (default threshold)
      for (let i = 0; i < 5; i++) {
        defaultBreaker.recordFailure();
      }
      expect(defaultBreaker.getStats().state).toBe("OPEN");
    });
  });

  describe("CLOSED -> OPEN transition", () => {
    it("opens after reaching failure threshold", () => {
      circuitBreaker.recordFailure();
      circuitBreaker.recordFailure();
      expect(circuitBreaker.getStats().state).toBe("CLOSED");

      circuitBreaker.recordFailure(); // 3rd failure, threshold reached
      expect(circuitBreaker.getStats().state).toBe("OPEN");
    });

    it("rejects execution when OPEN", () => {
      // Trigger open state
      for (let i = 0; i < 3; i++) {
        circuitBreaker.recordFailure();
      }

      expect(circuitBreaker.canExecute()).toBe(false);
    });

    it("tracks failure count correctly", () => {
      circuitBreaker.recordFailure();
      expect(circuitBreaker.getStats().failureCount).toBe(1);

      circuitBreaker.recordFailure();
      expect(circuitBreaker.getStats().failureCount).toBe(2);
    });

    it("records last failure time", () => {
      const now = Date.now();
      circuitBreaker.recordFailure();

      const stats = circuitBreaker.getStats();
      expect(stats.lastFailureTime).toBe(now);
    });
  });

  describe("success handling in CLOSED state", () => {
    it("resets failure count on success", () => {
      circuitBreaker.recordFailure();
      circuitBreaker.recordFailure();
      expect(circuitBreaker.getStats().failureCount).toBe(2);

      circuitBreaker.recordSuccess();
      expect(circuitBreaker.getStats().failureCount).toBe(0);
    });

    it("increments success count", () => {
      circuitBreaker.recordSuccess();
      circuitBreaker.recordSuccess();
      expect(circuitBreaker.getStats().successCount).toBe(2);
    });
  });

  describe("OPEN -> HALF_OPEN transition", () => {
    beforeEach(() => {
      // Open the circuit
      for (let i = 0; i < 3; i++) {
        circuitBreaker.recordFailure();
      }
    });

    it("transitions to HALF_OPEN after reset timeout", () => {
      expect(circuitBreaker.getStats().state).toBe("OPEN");
      expect(circuitBreaker.canExecute()).toBe(false);

      // Advance time past reset timeout
      vi.advanceTimersByTime(10001);

      expect(circuitBreaker.canExecute()).toBe(true);
      expect(circuitBreaker.getStats().state).toBe("HALF_OPEN");
    });

    it("stays OPEN before reset timeout", () => {
      vi.advanceTimersByTime(5000);

      expect(circuitBreaker.canExecute()).toBe(false);
      expect(circuitBreaker.getStats().state).toBe("OPEN");
    });
  });

  describe("HALF_OPEN state", () => {
    beforeEach(() => {
      // Open the circuit
      for (let i = 0; i < 3; i++) {
        circuitBreaker.recordFailure();
      }
      // Advance to half-open
      vi.advanceTimersByTime(10001);
      circuitBreaker.canExecute(); // Trigger transition
    });

    it("allows limited calls in HALF_OPEN state", () => {
      expect(circuitBreaker.getStats().state).toBe("HALF_OPEN");

      // First call allowed
      expect(circuitBreaker.canExecute()).toBe(true);

      // Note: In HALF_OPEN, recordFailure() immediately transitions to OPEN
      // So we test that multiple canExecute() calls work before any result is recorded
      expect(circuitBreaker.canExecute()).toBe(true);
    });

    it("closes on success in HALF_OPEN state", () => {
      circuitBreaker.recordSuccess();

      expect(circuitBreaker.getStats().state).toBe("CLOSED");
      expect(circuitBreaker.getStats().failureCount).toBe(0);
    });

    it("reopens on failure in HALF_OPEN state", () => {
      circuitBreaker.recordFailure();

      expect(circuitBreaker.getStats().state).toBe("OPEN");
    });
  });

  describe("reset()", () => {
    it("resets to CLOSED state", () => {
      // Open the circuit
      for (let i = 0; i < 3; i++) {
        circuitBreaker.recordFailure();
      }
      expect(circuitBreaker.getStats().state).toBe("OPEN");

      circuitBreaker.reset();

      const stats = circuitBreaker.getStats();
      expect(stats.state).toBe("CLOSED");
      expect(stats.failureCount).toBe(0);
      expect(stats.successCount).toBe(0);
      expect(stats.lastFailureTime).toBeNull();
    });

    it("allows execution after reset", () => {
      for (let i = 0; i < 3; i++) {
        circuitBreaker.recordFailure();
      }
      expect(circuitBreaker.canExecute()).toBe(false);

      circuitBreaker.reset();
      expect(circuitBreaker.canExecute()).toBe(true);
    });
  });

  describe("getStats()", () => {
    it("returns complete stats object", () => {
      circuitBreaker.recordSuccess();
      circuitBreaker.recordFailure();

      const stats = circuitBreaker.getStats();

      expect(stats).toEqual({
        state: "CLOSED",
        failureCount: 1,
        successCount: 1,
        lastFailureTime: expect.any(Number),
        halfOpenCalls: 0,
      });
    });
  });

  describe("full lifecycle", () => {
    it("handles complete cycle: CLOSED -> OPEN -> HALF_OPEN -> CLOSED", () => {
      // Start CLOSED
      expect(circuitBreaker.getStats().state).toBe("CLOSED");

      // Trigger failures to OPEN
      for (let i = 0; i < 3; i++) {
        circuitBreaker.recordFailure();
      }
      expect(circuitBreaker.getStats().state).toBe("OPEN");

      // Wait for reset timeout
      vi.advanceTimersByTime(10001);
      circuitBreaker.canExecute(); // Trigger HALF_OPEN
      expect(circuitBreaker.getStats().state).toBe("HALF_OPEN");

      // Success in HALF_OPEN closes circuit
      circuitBreaker.recordSuccess();
      expect(circuitBreaker.getStats().state).toBe("CLOSED");
      expect(circuitBreaker.canExecute()).toBe(true);
    });

    it("handles cycle with failed recovery: CLOSED -> OPEN -> HALF_OPEN -> OPEN", () => {
      // Trigger failures to OPEN
      for (let i = 0; i < 3; i++) {
        circuitBreaker.recordFailure();
      }

      // Wait for reset timeout
      vi.advanceTimersByTime(10001);
      circuitBreaker.canExecute(); // Trigger HALF_OPEN
      expect(circuitBreaker.getStats().state).toBe("HALF_OPEN");

      // Failure in HALF_OPEN reopens circuit
      circuitBreaker.recordFailure();
      expect(circuitBreaker.getStats().state).toBe("OPEN");
      expect(circuitBreaker.canExecute()).toBe(false);
    });
  });
});

describe("CircuitBreakerOpenError", () => {
  it("creates error with message and stats", () => {
    const stats = {
      state: "OPEN" as const,
      failureCount: 5,
      successCount: 10,
      lastFailureTime: Date.now(),
      halfOpenCalls: 0,
    };

    const error = new CircuitBreakerOpenError("Service unavailable", stats);

    expect(error.message).toBe("Service unavailable");
    expect(error.name).toBe("CircuitBreakerOpenError");
    expect(error.stats).toEqual(stats);
  });

  it("uses default message when not provided", () => {
    const stats = {
      state: "OPEN" as const,
      failureCount: 5,
      successCount: 10,
      lastFailureTime: null,
      halfOpenCalls: 0,
    };

    const error = new CircuitBreakerOpenError(undefined, stats);

    expect(error.message).toBe("Service temporarily unavailable");
  });

  it("is instanceof Error", () => {
    const stats = {
      state: "OPEN" as const,
      failureCount: 0,
      successCount: 0,
      lastFailureTime: null,
      halfOpenCalls: 0,
    };

    const error = new CircuitBreakerOpenError("Test", stats);

    expect(error instanceof Error).toBe(true);
    expect(error instanceof CircuitBreakerOpenError).toBe(true);
  });
});
