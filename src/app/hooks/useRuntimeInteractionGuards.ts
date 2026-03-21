import { useEffect } from "react";

const guardedEvents = ["contextmenu", "dragstart", "selectstart"];

export function useRuntimeInteractionGuards(surfaceElement: HTMLElement | null) {
  useEffect(() => {
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
  }, [surfaceElement]);
}
