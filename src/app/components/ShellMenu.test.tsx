import { fireEvent, render, screen, within } from "@testing-library/react";
import { vi } from "vitest";

import { ShellMenu } from "./ShellMenu";

const createProps = (overrides: Partial<React.ComponentProps<typeof ShellMenu>> = {}) => ({
  activeScene: "runtime" as const,
  cameraMode: "follow-entity" as const,
  canInstall: false,
  diagnosticsEnabled: true,
  diagnosticsVisible: false,
  inspecteurVisible: false,
  isOpen: true,
  isFullscreen: false,
  isFullscreenSupported: true,
  onEnterFullscreen: vi.fn(),
  onInstall: vi.fn(),
  onOpenChange: vi.fn(),
  onResetCamera: vi.fn(),
  onResumeRuntime: vi.fn(),
  onSetCameraMode: vi.fn(),
  onShowPauseScene: vi.fn(),
  onShowSettingsScene: vi.fn(),
  onToggleDiagnostics: vi.fn(),
  onToggleInspecteur: vi.fn(),
  ...overrides
});

describe("ShellMenu", () => {
  it("routes runtime pause through the shell-owned pause scene", () => {
    const props = createProps();

    render(<ShellMenu {...props} />);

    fireEvent.click(screen.getByRole("button", { name: /Pause runtime/i }));

    expect(props.onShowPauseScene).toHaveBeenCalledTimes(1);
    expect(props.onResumeRuntime).not.toHaveBeenCalled();
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("routes runtime re-entry through the resume action outside the live scene", () => {
    const props = createProps({
      activeScene: "pause"
    });

    render(<ShellMenu {...props} />);

    fireEvent.click(screen.getByRole("button", { name: /Resume runtime/i }));

    expect(props.onResumeRuntime).toHaveBeenCalledTimes(1);
    expect(props.onShowPauseScene).not.toHaveBeenCalled();
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("exposes diagnostics, settings, and camera controls inside the shell panel", () => {
    const props = createProps();

    render(<ShellMenu {...props} />);

    const panel = screen.getByLabelText("Shell menu");

    expect(within(panel).getByRole("button", { name: /Diagnostics/i })).toBeInTheDocument();
    expect(within(panel).getByRole("button", { name: /Settings/i })).toBeInTheDocument();
    expect(within(panel).getByRole("button", { name: "Free" })).toBeInTheDocument();
    expect(within(panel).getByRole("button", { name: "Follow entity" })).toBeInTheDocument();
  });

  it("renders a stateful command deck trigger and contextual header for the live runtime", () => {
    const props = createProps({
      isOpen: false
    });

    render(<ShellMenu {...props} />);

    expect(screen.getByRole("button", { name: /Command deck/i })).toHaveTextContent("Live");
  });

  it("renders paused shell context inside the opened command deck", () => {
    const props = createProps({
      activeScene: "pause"
    });

    render(<ShellMenu {...props} />);

    const panel = screen.getByLabelText("Shell menu");

    expect(within(panel).getByText("Session pause")).toBeInTheDocument();
    expect(within(panel).getByText("Paused")).toBeInTheDocument();
    expect(within(panel).getByText(/shell owns the pause scene/i)).toBeInTheDocument();
  });
});
