import { useEffect, useMemo, useState } from "react";
import "./DesktopControlSettingsSection.css";

import {
  areDesktopControlBindingsEqual,
  assignDesktopControlBinding,
  createDesktopControlConflictSet,
  desktopControlSlotOrder,
  formatDesktopControlBindingKey,
  validateDesktopControlBindingKey
} from "../model/desktopControlBindings";
import type { DesktopControlSlotIndex } from "../model/desktopControlBindings";
import {
  createDefaultDesktopControlBindings,
  desktopControlDirections
} from "../../game/input/model/singleEntityControlContract";
import type {
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

export function DesktopControlSettingsSection({
  bindings,
  onApply
}: DesktopControlSettingsSectionProps) {
  const [draftBindings, setDraftBindings] = useState(bindings);
  const [captureState, setCaptureState] = useState<{
    direction: DesktopControlDirection;
    slotIndex: DesktopControlSlotIndex;
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
        `${directionLabels[captureState.direction]} now uses ${formatDesktopControlBindingKey(validation.normalizedKey)}.`
      );
      setCaptureState(null);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [captureState]);

  const statusCopy = useMemo(() => {
    if (conflictSet.size > 0) {
      return "Resolve duplicate keys before applying changes.";
    }

    if (captureState) {
      return "Press a key to replace the selected binding. Escape cancels.";
    }

    if (captureMessage) {
      return captureMessage;
    }

    return hasUnsavedChanges
      ? "Unsaved control edits are ready to apply."
      : "Saved desktop bindings are active.";
  }, [captureMessage, captureState, conflictSet.size, hasUnsavedChanges]);

  return (
    <section className="settings-controls" aria-label="Desktop controls">
      <div className="settings-controls__header">
        <div>
          <p className="settings-controls__eyebrow">Desktop controls</p>
          <h3 className="settings-controls__title">Movement bindings</h3>
        </div>
        <p className="settings-controls__status" data-conflict={conflictSet.size > 0}>
          {statusCopy}
        </p>
      </div>

      <div className="settings-controls__grid">
        {desktopControlDirections.map((direction) => (
          <div className="settings-controls__row" key={direction}>
            <span className="settings-controls__label">{directionLabels[direction]}</span>
            <div className="settings-controls__bindings">
              {desktopControlSlotOrder.map((slotIndex) => {
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
                      : formatDesktopControlBindingKey(draftBindings[direction][slotIndex])}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="settings-controls__actions">
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
        <button
          className="shell-control shell-control--button"
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
