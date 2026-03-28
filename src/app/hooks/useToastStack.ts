import { useCallback, useEffect, useRef, useState } from "react";

export type ShellToastTone = "info" | "success";

export type ShellToast = {
  createdAtMs: number;
  expiresAtMs: number;
  id: string;
  message: string;
  tone: ShellToastTone;
};

export type PushShellToastInput = {
  message: string;
  tone?: ShellToastTone;
};

const shellToastLifetimeMs = 5000;

export function useToastStack() {
  const [toasts, setToasts] = useState<ShellToast[]>([]);
  const timeoutByToastIdRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismissToast = useCallback((toastId: string) => {
    const timeoutId = timeoutByToastIdRef.current.get(toastId);

    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
      timeoutByToastIdRef.current.delete(toastId);
    }

    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== toastId));
  }, []);

  const pushToast = useCallback(
    ({ message, tone = "info" }: PushShellToastInput) => {
      const createdAtMs = Date.now();
      const toastId = `shell-toast:${createdAtMs}:${Math.round(Math.random() * 1_000_000)}`;
      const nextToast: ShellToast = {
        createdAtMs,
        expiresAtMs: createdAtMs + shellToastLifetimeMs,
        id: toastId,
        message,
        tone
      };

      setToasts((currentToasts) => [...currentToasts, nextToast]);
      timeoutByToastIdRef.current.set(
        toastId,
        setTimeout(() => {
          dismissToast(toastId);
        }, shellToastLifetimeMs)
      );

      return toastId;
    },
    [dismissToast]
  );

  useEffect(
    () => () => {
      timeoutByToastIdRef.current.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      timeoutByToastIdRef.current.clear();
    },
    []
  );

  return {
    dismissToast,
    pushToast,
    toasts
  };
}
