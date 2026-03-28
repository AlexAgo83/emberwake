import type { CSSProperties } from "react";

import type { ShellToast } from "../hooks/useToastStack";

type ShellToastStackProps = {
  onDismiss: (toastId: string) => void;
  toasts: readonly ShellToast[];
};

export function ShellToastStack({ onDismiss, toasts }: ShellToastStackProps) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div aria-atomic="false" aria-live="polite" className="app-toast-stack">
      {toasts.map((toast) => (
        <div
          className="app-toast"
          data-tone={toast.tone}
          key={toast.id}
          role="status"
          style={
            {
              "--toast-lifetime-ms": `${Math.max(0, toast.expiresAtMs - toast.createdAtMs)}ms`
            } as CSSProperties
          }
        >
          <p className="app-toast__message">{toast.message}</p>
          <button
            aria-label={`Dismiss ${toast.message}`}
            className="app-toast__dismiss"
            onClick={() => {
              onDismiss(toast.id);
            }}
            type="button"
          >
            Dismiss
          </button>
        </div>
      ))}
    </div>
  );
}
