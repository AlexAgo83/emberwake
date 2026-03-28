type AppUpdatePromptProps = {
  isApplyingUpdate: boolean;
  isOpen: boolean;
  isUpdateReady: boolean;
  onApplyUpdate: () => void;
  onDismiss: () => void;
  onReopen: () => void;
};

export function AppUpdatePrompt({
  isApplyingUpdate,
  isOpen,
  isUpdateReady,
  onApplyUpdate,
  onDismiss,
  onReopen
}: AppUpdatePromptProps) {
  if (!isUpdateReady) {
    return null;
  }

  return (
    <>
      {!isOpen ? (
        <button className="app-update-chip" onClick={onReopen} type="button">
          Update ready
        </button>
      ) : null}
      {isOpen ? (
        <div className="app-update-modal__backdrop">
          <section
            aria-label="Application update available"
            aria-modal="true"
            className="app-update-modal"
            role="dialog"
          >
            <p className="app-update-modal__eyebrow">Deployment update</p>
            <h2 className="app-update-modal__title">A newer build is ready.</h2>
            <p className="app-update-modal__detail">
              Refresh when you are ready to apply the latest version. The current session will be
              reloaded on confirmation.
            </p>
            <div className="app-update-modal__actions">
              <button
                className="shell-control shell-control--button"
                disabled={isApplyingUpdate}
                onClick={onDismiss}
                type="button"
              >
                Later
              </button>
              <button
                className="shell-control shell-control--button shell-control--button-primary"
                disabled={isApplyingUpdate}
                onClick={onApplyUpdate}
                type="button"
              >
                {isApplyingUpdate ? "Updating..." : "Update now"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
