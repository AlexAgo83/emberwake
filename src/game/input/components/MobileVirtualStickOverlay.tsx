import { singleEntityControlContract } from "../model/singleEntityControlContract";
import type { MobileVirtualStickState } from "../hooks/useMobileVirtualStick";

type MobileVirtualStickOverlayProps = {
  stickState: MobileVirtualStickState;
};

export function MobileVirtualStickOverlay({
  stickState
}: MobileVirtualStickOverlayProps) {
  if (!stickState.isVisible) {
    return null;
  }

  const baseSize = singleEntityControlContract.virtualStick.maxRadiusPixels * 2;

  return (
    <div className="mobile-virtual-stick" aria-hidden="true">
      <div
        className="mobile-virtual-stick__base"
        style={{
          height: `${baseSize}px`,
          left: `${stickState.anchor.x}px`,
          top: `${stickState.anchor.y}px`,
          width: `${baseSize}px`
        }}
      />
      <div
        className="mobile-virtual-stick__knob"
        style={{
          left: `${stickState.knob.x}px`,
          top: `${stickState.knob.y}px`
        }}
      />
    </div>
  );
}
