import { useMemo, useRef } from 'react';

export function useThrottleFn<T extends (...args: any[]) => void>(fn: T, waitMs: number): T {
  const last = useRef(0);
  return useMemo(
    () =>
      ((...args: Parameters<T>) => {
        const now = Date.now();
        if (now - last.current < waitMs) {
          return;
        }
        last.current = now;
        fn(...args);
      }) as T,
    [fn, waitMs],
  );
}
