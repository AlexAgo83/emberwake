import { useEffect } from "react";

const LOCK_ATTRIBUTE = "data-app-viewport-lock";
const DISPLAY_MODE_ATTRIBUTE = "data-app-display-mode";
const VIEWPORT_HEIGHT_VARIABLE = "--app-viewport-height";
const resolveStandaloneMode = () =>
  window.matchMedia?.("(display-mode: standalone)")?.matches ||
  ("standalone" in navigator && navigator.standalone === true);

export function useDocumentViewportLock() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const previousHtmlValue = html.getAttribute(LOCK_ATTRIBUTE);
    const previousBodyValue = body.getAttribute(LOCK_ATTRIBUTE);
    const previousDisplayMode = html.getAttribute(DISPLAY_MODE_ATTRIBUTE);
    const previousViewportHeight = html.style.getPropertyValue(VIEWPORT_HEIGHT_VARIABLE);

    const syncViewportState = () => {
      const viewportHeight =
        window.visualViewport?.height ?? window.innerHeight ?? document.documentElement.clientHeight;

      html.style.setProperty(VIEWPORT_HEIGHT_VARIABLE, `${Math.round(viewportHeight)}px`);
      html.setAttribute(
        DISPLAY_MODE_ATTRIBUTE,
        resolveStandaloneMode() ? "standalone" : "browser"
      );
    };

    html.setAttribute(LOCK_ATTRIBUTE, "true");
    body.setAttribute(LOCK_ATTRIBUTE, "true");
    syncViewportState();

    const handleViewportResize = () => {
      syncViewportState();
    };

    window.visualViewport?.addEventListener("resize", handleViewportResize);
    window.addEventListener("resize", handleViewportResize);

    return () => {
      window.visualViewport?.removeEventListener("resize", handleViewportResize);
      window.removeEventListener("resize", handleViewportResize);

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

      if (previousDisplayMode === null) {
        html.removeAttribute(DISPLAY_MODE_ATTRIBUTE);
      } else {
        html.setAttribute(DISPLAY_MODE_ATTRIBUTE, previousDisplayMode);
      }

      if (previousViewportHeight.length === 0) {
        html.style.removeProperty(VIEWPORT_HEIGHT_VARIABLE);
      } else {
        html.style.setProperty(VIEWPORT_HEIGHT_VARIABLE, previousViewportHeight);
      }
    };
  }, []);
}
