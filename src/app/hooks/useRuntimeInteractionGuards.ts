import { useEffect } from "react";
import type { RefObject } from "react";

const guardedEvents = ["contextmenu", "dragstart", "selectstart"];

export function useRuntimeInteractionGuards(surfaceRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const surfaceElement = surfaceRef.current;
    if (!surfaceElement) {
      return;
    }

    const preventDefault = (event: Event) => {
      event.preventDefault();
    };

    guardedEvents.forEach((eventName) => {
      surfaceElement.addEventListener(eventName, preventDefault);
    });

    return () => {
      guardedEvents.forEach((eventName) => {
        surfaceElement.removeEventListener(eventName, preventDefault);
      });
    };
  }, [surfaceRef]);
}
