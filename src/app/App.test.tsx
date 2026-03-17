import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { App } from "./App";

Object.defineProperty(document, "fullscreenEnabled", {
  configurable: true,
  value: true
});

Object.defineProperty(HTMLElement.prototype, "requestFullscreen", {
  configurable: true,
  value: vi.fn().mockResolvedValue(undefined)
});

vi.mock("../game/render/RuntimeSurface", () => ({
  RuntimeSurface: () => <div data-testid="runtime-surface" />
}));

describe("App", () => {
  it("renders the runtime shell controls", () => {
    render(<App />);

    expect(screen.getByTestId("runtime-surface")).toBeInTheDocument();
    expect(screen.getByText("Emberwake runtime")).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Enter fullscreen"
      })
    ).toBeInTheDocument();
  });
});
