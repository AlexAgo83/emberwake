import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useSampledValue } from "./useSampledValue";

describe("useSampledValue", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the latest value immediately without passive update loops when sampling is disabled", () => {
    const { result, rerender } = renderHook(
      ({ value, enabled }) =>
        useSampledValue(value, {
          enabled,
          intervalMs: 100
        }),
      {
        initialProps: {
          enabled: false,
          value: { tick: 1 }
        }
      }
    );

    expect(result.current).toEqual({ tick: 1 });

    rerender({
      enabled: false,
      value: { tick: 2 }
    });

    expect(result.current).toEqual({ tick: 2 });
  });

  it("samples the latest value on the configured interval when enabled", () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(
      ({ value }) =>
        useSampledValue(value, {
          enabled: true,
          intervalMs: 100
        }),
      {
        initialProps: {
          value: { tick: 1 }
        }
      }
    );

    expect(result.current).toEqual({ tick: 1 });

    rerender({
      value: { tick: 2 }
    });

    expect(result.current).toEqual({ tick: 1 });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toEqual({ tick: 2 });
  });
});
