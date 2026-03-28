import { useCallback, useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

export function usePwaUpdatePrompt() {
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [isApplyingUpdate, setIsApplyingUpdate] = useState(false);
  const {
    needRefresh: [isUpdateReady],
    updateServiceWorker
  } = useRegisterSW({
    onRegisteredSW: async (_swUrl, registration) => {
      await registration?.update();
    }
  });

  useEffect(() => {
    if (isUpdateReady) {
      setIsPromptOpen(true);
      return;
    }

    setIsPromptOpen(false);
    setIsApplyingUpdate(false);
  }, [isUpdateReady]);

  const dismissPrompt = useCallback(() => {
    setIsPromptOpen(false);
  }, []);

  const reopenPrompt = useCallback(() => {
    if (!isUpdateReady) {
      return;
    }

    setIsPromptOpen(true);
  }, [isUpdateReady]);

  const applyUpdate = useCallback(async () => {
    setIsApplyingUpdate(true);

    try {
      await updateServiceWorker(true);
    } finally {
      setIsApplyingUpdate(false);
    }
  }, [updateServiceWorker]);

  return {
    applyUpdate,
    dismissPrompt,
    isApplyingUpdate,
    isPromptOpen,
    isUpdateReady,
    reopenPrompt
  };
}
