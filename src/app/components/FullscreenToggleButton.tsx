type FullscreenToggleButtonProps = {
  isFullscreen: boolean;
  isSupported: boolean;
  onEnterFullscreen: () => void;
};

export function FullscreenToggleButton({
  isFullscreen,
  isSupported,
  onEnterFullscreen
}: FullscreenToggleButtonProps) {
  if (!isSupported) {
    return (
      <span className="shell-control shell-control--status" role="status">
        Fullscreen unavailable
      </span>
    );
  }

  return (
    <button
      className="shell-control shell-control--button"
      onClick={onEnterFullscreen}
      type="button"
    >
      {isFullscreen ? "Fullscreen active" : "Enter fullscreen"}
    </button>
  );
}
