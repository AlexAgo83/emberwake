import { fireEvent, render, screen, within } from "@testing-library/react";
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
  it("renders a single floating menu trigger by default", () => {
    render(<App />);

    expect(screen.getByTestId("runtime-surface")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Menu" })).toBeInTheDocument();
    expect(screen.queryByText("Emberwake runtime")).not.toBeInTheDocument();
    expect(screen.queryByText("Movement-first loop")).not.toBeInTheDocument();
    expect(screen.queryByTestId("entity-inspection")).not.toBeInTheDocument();
  });

  it("opens menu-driven inspecteur and diagnostics surfaces on demand", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    const shellMenu = screen.getByLabelText("Shell menu");

    expect(within(shellMenu).getByRole("button", { name: /Inspecteur/i })).toBeInTheDocument();
    expect(within(shellMenu).getByRole("button", { name: /Diagnostics/i })).toBeInTheDocument();

    fireEvent.click(within(shellMenu).getByRole("button", { name: /Inspecteur/i }));

    expect(screen.getByTestId("entity-inspection")).toBeInTheDocument();
    expect(screen.queryByLabelText("Shell diagnostics")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    fireEvent.click(
      within(screen.getByLabelText("Shell menu")).getByRole("button", { name: /Diagnostics/i })
    );

    expect(screen.getByLabelText("Shell diagnostics")).toBeInTheDocument();
  });
});
