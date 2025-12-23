/**
 * Circuit Breaker Pattern Implementation
 *
 * Prevents cascade failures when backend services are unavailable.
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Service is failing, requests are rejected immediately
 * - HALF_OPEN: Testing if service has recovered
 */

export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface CircuitBreakerOptions {
  /** Number of failures before circuit opens (default: 5) */
  failureThreshold?: number;
  /** Time in ms before attempting recovery (default: 30000) */
  resetTimeout?: number;
  /** Max calls allowed in half-open state (default: 3) */
  halfOpenMaxCalls?: number;
}

export interface CircuitBreakerStats {
  state: CircuitState;
  failureCount: number;
  successCount: number;
  lastFailureTime: number | null;
  halfOpenCalls: number;
}

export class CircuitBreakerOpenError extends Error {
  constructor(
    message: string = "Service temporarily unavailable",
    public stats: CircuitBreakerStats,
  ) {
    super(message);
    this.name = "CircuitBreakerOpenError";
  }
}

export class CircuitBreaker {
  private state: CircuitState = "CLOSED";
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime: number | null = null;
  private halfOpenCalls = 0;

  private readonly failureThreshold: number;
  private readonly resetTimeout: number;
  private readonly halfOpenMaxCalls: number;

  constructor(options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold ?? 5;
    this.resetTimeout = options.resetTimeout ?? 30000;
    this.halfOpenMaxCalls = options.halfOpenMaxCalls ?? 3;
  }

  /**
   * Check if circuit allows execution
   */
  canExecute(): boolean {
    switch (this.state) {
      case "CLOSED":
        return true;

      case "OPEN": {
        // Check if reset timeout has passed
        if (this.lastFailureTime && Date.now() - this.lastFailureTime >= this.resetTimeout) {
          this.transitionTo("HALF_OPEN");
          return true;
        }
        return false;
      }

      case "HALF_OPEN":
        // Allow limited calls to test recovery
        return this.halfOpenCalls < this.halfOpenMaxCalls;
    }
  }

  /**
   * Record a successful operation
   */
  recordSuccess(): void {
    this.successCount++;

    if (this.state === "HALF_OPEN") {
      // Service has recovered, close the circuit
      this.transitionTo("CLOSED");
    } else if (this.state === "CLOSED") {
      // Reset failure count on success
      this.failureCount = 0;
    }
  }

  /**
   * Record a failed operation
   */
  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === "HALF_OPEN") {
      // Service still failing, reopen circuit
      this.transitionTo("OPEN");
    } else if (this.state === "CLOSED" && this.failureCount >= this.failureThreshold) {
      // Threshold reached, open circuit
      this.transitionTo("OPEN");
    }
  }

  /**
   * Get current circuit breaker statistics
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      halfOpenCalls: this.halfOpenCalls,
    };
  }

  /**
   * Manually reset the circuit breaker
   */
  reset(): void {
    this.transitionTo("CLOSED");
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
  }

  private transitionTo(newState: CircuitState): void {
    if (this.state === newState) return;

    this.state = newState;

    if (newState === "CLOSED") {
      this.failureCount = 0;
      this.halfOpenCalls = 0;
    } else if (newState === "HALF_OPEN") {
      this.halfOpenCalls = 0;
    }
  }
}
