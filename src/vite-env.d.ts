/// <reference types="vite/client" />

declare module "virtual:pwa-register/react" {
  export type RegisterSWOptions = {
    onRegisteredSW?: (
      swUrl: string,
      registration?: ServiceWorkerRegistration
    ) => void | Promise<void>;
  };

  export function useRegisterSW(
    options?: RegisterSWOptions
  ): {
    needRefresh: [boolean, (value: boolean) => void];
    offlineReady: [boolean, (value: boolean) => void];
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
  };
}
