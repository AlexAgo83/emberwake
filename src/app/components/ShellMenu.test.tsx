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
  layoutMode: "large-screen" as const,
  onEnterFullscreen: vi.fn(),
  onInstall: vi.fn(),
  onOpenChange: vi.fn(),
  onResetCamera: vi.fn(),
  onRetryRuntime: vi.fn(),
  onResumeRuntime: vi.fn(),
  onSetCameraMode: vi.fn(),
  onShowPauseScene: vi.fn(),
  onShowSettingsScene: vi.fn(),
  onToggleDiagnostics: vi.fn(),
  onToggleInspecteur: vi.fn(),
  ...overrides
});

describe("ShellMenu", () => {
  it("routes the primary runtime action through the shell-owned pause scene when live", () => {
    const props = createProps();

    render(<ShellMenu {...props} />);

    fireEvent.click(screen.getByRole("button", { name: /Pause/i }));

    expect(props.onShowPauseScene).toHaveBeenCalledTimes(1);
    expect(props.onResumeRuntime).not.toHaveBeenCalled();
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("routes runtime re-entry through the primary action outside the live scene", () => {
    const props = createProps({
      activeScene: "pause"
    });

    render(<ShellMenu {...props} />);

    fireEvent.click(screen.getByRole("button", { name: /Resume runtime/i }));

    expect(props.onResumeRuntime).toHaveBeenCalledTimes(1);
    expect(props.onShowPauseScene).not.toHaveBeenCalled();
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("routes recovery states through the retry primary action", () => {
    const props = createProps({
      activeScene: "failure"
    });

    render(<ShellMenu {...props} />);

    fireEvent.click(screen.getByRole("button", { name: /Retry runtime/i }));

    expect(props.onRetryRuntime).toHaveBeenCalledTimes(1);
    expect(props.onResumeRuntime).not.toHaveBeenCalled();
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("exposes a single session section with nested view and tools groups inside the shell panel", () => {
    const props = createProps();

    render(<ShellMenu {...props} />);

    const panel = screen.getByLabelText("Shell menu");

    expect(within(panel).getByText("Session")).toBeInTheDocument();
    expect(within(panel).getByText("View")).toBeInTheDocument();
    expect(within(panel).getByText("Tools")).toBeInTheDocument();
    expect(within(panel).getByRole("button", { name: /Diagnostics/i })).toBeInTheDocument();
    expect(within(panel).getByRole("button", { name: /Settings/i })).toBeInTheDocument();
    expect(within(panel).getByRole("button", { name: "Free" })).toBeInTheDocument();
    expect(within(panel).getByRole("button", { name: "Follow entity" })).toBeInTheDocument();
    expect(panel.querySelectorAll(".shell-menu__section")).toHaveLength(1);
    expect(panel.querySelectorAll(".shell-menu__subsection")).toHaveLength(2);
  });

  it("marks session and view actions as secondary while tools stay utility-weight", () => {
    const props = createProps({
      canInstall: true
    });

    render(<ShellMenu {...props} />);

    expect(screen.getByRole("button", { name: /Settings/i })).toHaveClass("shell-menu__item--secondary");
    expect(screen.getByRole("button", { name: /Reset camera/i })).toHaveClass(
      "shell-menu__item--secondary"
    );
    expect(screen.getByRole("button", { name: /Diagnostics/i })).toHaveClass(
      "shell-menu__item--utility"
    );
    expect(screen.getByRole("button", { name: /Install app/i })).toHaveClass(
      "shell-menu__item--utility"
    );
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

  it("marks the command deck as mobile when the shell is in mobile layout mode", () => {
    const props = createProps({
      layoutMode: "mobile"
    });

    render(<ShellMenu {...props} />);

    expect(screen.getByLabelText("Shell menu").closest(".shell-menu")).toHaveAttribute(
      "data-layout-mode",
      "mobile"
    );
  });
});
