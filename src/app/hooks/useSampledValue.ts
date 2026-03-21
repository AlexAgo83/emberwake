import { useEffect, useRef, useState } from "react";

type UseSampledValueOptions = {
  enabled: boolean;
  intervalMs: number;
};

export function useSampledValue<T>(value: T, { enabled, intervalMs }: UseSampledValueOptions) {
  const latestValueRef = useRef(value);
  const [sampledValue, setSampledValue] = useState(value);

  latestValueRef.current = value;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    setSampledValue(latestValueRef.current);

    const intervalId = window.setInterval(() => {
      setSampledValue(latestValueRef.current);
    }, intervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [enabled, intervalMs]);

  return enabled ? sampledValue : value;
}
