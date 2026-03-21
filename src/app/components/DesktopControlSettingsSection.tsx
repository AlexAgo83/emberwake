import { useEffect, useMemo, useState } from "react";
import "./DesktopControlSettingsSection.css";

import {
  areDesktopControlBindingsEqual,
  assignDesktopControlBinding,
  createDesktopControlConflictSet,
  formatDesktopControlBindingKey,
  getDesktopControlSlotOrder,
  isDesktopCameraControlDirection,
  validateDesktopControlBindingKey
} from "../model/desktopControlBindings";
import {
  createDefaultDesktopControlBindings,
  desktopCameraControlDirections,
  desktopControlDirections
} from "../../game/input/model/singleEntityControlContract";
import type {
  DesktopCameraControlDirection,
  DesktopControlBindingDirection,
  DesktopControlBindings,
  DesktopControlDirection
} from "../../game/input/model/singleEntityControlContract";

type DesktopControlSettingsSectionProps = {
  bindings: DesktopControlBindings;
  onApply: (bindings: DesktopControlBindings) => void;
};

const directionLabels: Record<DesktopControlDirection, string> = {
  down: "Move down",
  left: "Move left",
  right: "Move right",
  up: "Move up"
};

const cameraDirectionLabels: Record<DesktopCameraControlDirection, string> = {
  rotateLeft: "Rotate left",
  rotateRight: "Rotate right"
};

const movementDirections = desktopControlDirections as readonly DesktopControlBindingDirection[];
const cameraDirections = desktopCameraControlDirections as readonly DesktopControlBindingDirection[];

export function DesktopControlSettingsSection({
  bindings,
  onApply
}: DesktopControlSettingsSectionProps) {
  const [draftBindings, setDraftBindings] = useState(bindings);
  const [captureState, setCaptureState] = useState<{
    direction: DesktopControlBindingDirection;
    slotIndex: 0 | 1;
  } | null>(null);
  const [captureMessage, setCaptureMessage] = useState<string | null>(null);
  const conflictSet = useMemo(
    () => createDesktopControlConflictSet(draftBindings),
    [draftBindings]
  );
  const hasUnsavedChanges = useMemo(
    () => !areDesktopControlBindingsEqual(draftBindings, bindings),
    [bindings, draftBindings]
  );
  const canApply = hasUnsavedChanges && conflictSet.size === 0;

  useEffect(() => {
    setDraftBindings(bindings);
  }, [bindings]);

  useEffect(() => {
    if (!captureState) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();

      if (event.key === "Escape") {
        setCaptureState(null);
        setCaptureMessage("Binding capture cancelled.");
        return;
      }

      const validation = validateDesktopControlBindingKey(event.key);

      if (validation.error || !validation.normalizedKey) {
        setCaptureMessage(validation.error);
        return;
      }

      setDraftBindings((currentBindings) =>
        assignDesktopControlBinding({
          bindings: currentBindings,
          direction: captureState.direction,
          key: validation.normalizedKey,
          slotIndex: captureState.slotIndex
        })
      );
      setCaptureMessage(
        `${
          isDesktopCameraControlDirection(captureState.direction)
            ? cameraDirectionLabels[captureState.direction]
            : directionLabels[captureState.direction]
        } now uses ${formatDesktopControlBindingKey(validation.normalizedKey)}.`
      );
      setCaptureState(null);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [captureState]);

  useEffect(() => {
    document.body.dataset.desktopControlCaptureActive = captureState ? "true" : "false";

    return () => {
      document.body.dataset.desktopControlCaptureActive = "false";
    };
  }, [captureState]);

  const statusCopy = useMemo(() => {
    if (conflictSet.size > 0) {
      return "Resolve duplicate keys before applying changes.";
    }

    if (captureState) {
      return "Press a key. Escape cancels.";
    }

    if (captureMessage) {
      return captureMessage;
    }

    return hasUnsavedChanges
      ? "Unsaved changes ready."
      : "Saved bindings active.";
  }, [captureMessage, captureState, conflictSet.size, hasUnsavedChanges]);

  const renderBindingRow = (direction: DesktopControlBindingDirection) => (
    <div className="settings-controls__row" key={direction}>
      <span className="settings-controls__label">
        {isDesktopCameraControlDirection(direction)
          ? cameraDirectionLabels[direction]
          : directionLabels[direction]}
      </span>
      <div className="settings-controls__bindings">
        {getDesktopControlSlotOrder(direction).map((slotIndex) => {
          const slotId = `${direction}:${slotIndex}`;
          const isCapturing =
            captureState?.direction === direction && captureState.slotIndex === slotIndex;

          return (
            <button
              className="settings-controls__binding shell-control shell-control--button"
              data-conflict={conflictSet.has(slotId)}
              data-capture={isCapturing}
              key={slotId}
              onClick={() => {
                setCaptureState({ direction, slotIndex });
                setCaptureMessage(null);
              }}
              type="button"
            >
              {isCapturing
                ? "Press key"
                : formatDesktopControlBindingKey(draftBindings[direction][slotIndex]!)}
            </button>
          );
        })}
        {isDesktopCameraControlDirection(direction) ? (
          <span className="settings-controls__binding settings-controls__binding--static shell-control">
            Shift held
          </span>
        ) : null}
      </div>
    </div>
  );

  return (
    <section className="settings-controls" aria-label="Desktop controls">
      <div className="settings-controls__header">
        <div>
          <h3 className="settings-controls__title">Desktop controls</h3>
          <p className="settings-controls__hint">Click a binding to replace it.</p>
        </div>
        <p className="settings-controls__status" data-conflict={conflictSet.size > 0}>
          {statusCopy}
        </p>
      </div>

      <div className="settings-controls__grid">
        <section className="settings-controls__group" aria-labelledby="settings-controls-movement">
          <div className="settings-controls__group-header">
            <h4 className="settings-controls__group-title" id="settings-controls-movement">
              Movement
            </h4>
          </div>
          <div className="settings-controls__group-rows">
            {movementDirections.map(renderBindingRow)}
          </div>
        </section>

        <section className="settings-controls__group" aria-labelledby="settings-controls-camera">
          <div className="settings-controls__group-header">
            <h4 className="settings-controls__group-title" id="settings-controls-camera">
              Camera
            </h4>
          </div>
          <div className="settings-controls__group-rows">
            {cameraDirections.map(renderBindingRow)}
          </div>
        </section>
      </div>

      <div className="settings-controls__actions">
        <div className="settings-controls__actions-secondary">
          <button
            className="shell-control shell-control--button"
            disabled={!hasUnsavedChanges}
            onClick={() => {
              setDraftBindings(bindings);
              setCaptureState(null);
              setCaptureMessage("Unsaved changes reverted.");
            }}
            type="button"
          >
            Revert
          </button>
          <button
            className="shell-control shell-control--button"
            onClick={() => {
              setDraftBindings(createDefaultDesktopControlBindings());
              setCaptureState(null);
              setCaptureMessage("Draft controls reset to product defaults.");
            }}
            type="button"
          >
            Reset defaults
          </button>
        </div>
        <button
          className="shell-control shell-control--button settings-controls__apply"
          disabled={!canApply}
          onClick={() => {
            onApply(draftBindings);
            setCaptureMessage("Desktop controls applied.");
          }}
          type="button"
        >
          Apply controls
        </button>
      </div>
    </section>
  );
}
