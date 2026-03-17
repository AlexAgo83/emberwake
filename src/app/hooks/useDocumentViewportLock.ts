import { useEffect } from "react";

const LOCK_ATTRIBUTE = "data-app-viewport-lock";

export function useDocumentViewportLock() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const previousHtmlValue = html.getAttribute(LOCK_ATTRIBUTE);
    const previousBodyValue = body.getAttribute(LOCK_ATTRIBUTE);

    html.setAttribute(LOCK_ATTRIBUTE, "true");
    body.setAttribute(LOCK_ATTRIBUTE, "true");

    return () => {
      if (previousHtmlValue === null) {
        html.removeAttribute(LOCK_ATTRIBUTE);
      } else {
        html.setAttribute(LOCK_ATTRIBUTE, previousHtmlValue);
      }

      if (previousBodyValue === null) {
        body.removeAttribute(LOCK_ATTRIBUTE);
      } else {
        body.setAttribute(LOCK_ATTRIBUTE, previousBodyValue);
      }
    };
  }, []);
}
