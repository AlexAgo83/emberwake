import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { DesktopControlSettingsSection } from "./DesktopControlSettingsSection";
import { createDefaultDesktopControlBindings } from "../../game/input/model/singleEntityControlContract";

describe("DesktopControlSettingsSection", () => {
  it("treats desktop controls as the section title instead of a nested movement subpanel", () => {
    render(
      <DesktopControlSettingsSection
        bindings={createDefaultDesktopControlBindings()}
        onApply={vi.fn()}
      />
    );

    expect(screen.getByRole("heading", { name: /Desktop controls/i })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /Movement bindings/i })).not.toBeInTheDocument();
    expect(screen.getByText("Rotate left")).toBeInTheDocument();
    expect(screen.getByText("Rotate right")).toBeInTheDocument();
    expect(screen.getAllByText("Shift held")).toHaveLength(2);
  });

  it("captures a replacement key for a selected movement slot", () => {
    const onApply = vi.fn();

    render(
      <DesktopControlSettingsSection
        bindings={createDefaultDesktopControlBindings()}
        onApply={onApply}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "W" }));
    fireEvent.keyDown(window, {
      key: "i"
    });

    expect(screen.getByRole("button", { name: "I" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Apply controls/i }));
    expect(onApply).toHaveBeenCalledWith({
      down: ["s", "ArrowDown"],
      left: ["a", "ArrowLeft"],
      right: ["d", "ArrowRight"],
      rotateLeft: ["q"],
      rotateRight: ["e"],
      up: ["i", "ArrowUp"]
    });
  });

  it("flags duplicate bindings and disables apply until conflicts are resolved", () => {
    render(
      <DesktopControlSettingsSection
        bindings={createDefaultDesktopControlBindings()}
        onApply={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "W" }));
    fireEvent.keyDown(window, { key: "a" });

    expect(screen.getByText(/Resolve duplicate keys/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Apply controls/i })).toBeDisabled();
  });

  it("captures a replacement key for a rotation slot", () => {
    const onApply = vi.fn();

    render(
      <DesktopControlSettingsSection
        bindings={createDefaultDesktopControlBindings()}
        onApply={onApply}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Q" }));
    fireEvent.keyDown(window, { key: "u" });
    fireEvent.click(screen.getByRole("button", { name: /Apply controls/i }));

    expect(onApply).toHaveBeenCalledWith({
      down: ["s", "ArrowDown"],
      left: ["a", "ArrowLeft"],
      right: ["d", "ArrowRight"],
      rotateLeft: ["u"],
      rotateRight: ["e"],
      up: ["w", "ArrowUp"]
    });
  });
});
