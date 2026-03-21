import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { DesktopControlSettingsSection } from "./DesktopControlSettingsSection";
import { createDefaultDesktopControlBindings } from "../../game/input/model/singleEntityControlContract";

describe("DesktopControlSettingsSection", () => {
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
});
