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
  onAbandonRun: vi.fn(),
  onEnterFullscreen: vi.fn(),
  onInstall: vi.fn(),
  onOpenChange: vi.fn(),
  onResetCamera: vi.fn(),
  onRetryRuntime: vi.fn(),
  onResumeRuntime: vi.fn(),
  onSetCameraMode: vi.fn(),
  onShowMainMenuScene: vi.fn(),
  onShowPauseScene: vi.fn(),
  onToggleRuntimeFeedback: vi.fn(),
  onToggleDiagnostics: vi.fn(),
  onToggleInspecteur: vi.fn(),
  runtimeFeedbackVisible: true,
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

  it("keeps Session as the root menu and routes View and Tools through dedicated submenus", () => {
    const props = createProps();

    render(<ShellMenu {...props} />);

    const panel = screen.getByLabelText("Shell menu");

    expect(within(panel).getByText("Session")).toBeInTheDocument();
    expect(within(panel).getByRole("button", { name: /Main menu/i })).toBeInTheDocument();
    expect(within(panel).getByRole("button", { name: /View/i })).toBeInTheDocument();
    expect(within(panel).getByRole("button", { name: /Tools/i })).toBeInTheDocument();
    expect(within(panel).queryByText(/^Diagnostics$/)).not.toBeInTheDocument();
    expect(within(panel).queryByRole("button", { name: /^Free$/ })).not.toBeInTheDocument();
    expect(panel.querySelectorAll(".shell-menu__section")).toHaveLength(1);
  });

  it("marks root session actions as secondary while the tools submenu entry stays utility-weight", () => {
    const props = createProps({
      canInstall: true
    });

    render(<ShellMenu {...props} />);

    expect(screen.getByRole("button", { name: /Main menu/i })).toHaveClass(
      "shell-menu__item--secondary"
    );
    expect(screen.getByRole("button", { name: /View/i })).toHaveClass("shell-menu__item--secondary");
    expect(screen.getByRole("button", { name: /Tools/i })).toHaveClass(
      "shell-menu__item--utility"
    );
  });

  it("opens a dedicated View submenu without keeping camera controls on the root screen", () => {
    const props = createProps();

    render(<ShellMenu {...props} />);

    fireEvent.click(screen.getByRole("button", { name: /View/i }));

    const panel = screen.getByLabelText("Shell menu");

    expect(within(panel).getByText("View")).toBeInTheDocument();
    expect(within(panel).getByRole("button", { name: /Back to Session/i })).toBeInTheDocument();
    expect(within(panel).getByRole("button", { name: /Reset camera/i })).toBeInTheDocument();
    expect(within(panel).getByRole("button", { name: "Free" })).toBeInTheDocument();
    expect(within(panel).getByRole("button", { name: "Follow entity" })).toBeInTheDocument();
    expect(within(panel).queryByRole("button", { name: /Main menu/i })).not.toBeInTheDocument();
  });

  it("opens a dedicated Tools submenu instead of keeping utility controls on the root screen", () => {
    const props = createProps({
      canInstall: true
    });

    render(<ShellMenu {...props} />);

    fireEvent.click(screen.getByRole("button", { name: /Tools/i }));

    const panel = screen.getByLabelText("Shell menu");

    expect(within(panel).getByText("Tools")).toBeInTheDocument();
    expect(within(panel).getByRole("button", { name: /Back to Session/i })).toBeInTheDocument();
    expect(within(panel).getByRole("button", { name: /Runtime feedback/i })).toBeInTheDocument();
    expect(within(panel).getByRole("button", { name: /Inspecteur/i })).toBeInTheDocument();
    expect(within(panel).getByRole("button", { name: /Diagnostics/i })).toBeInTheDocument();
    expect(within(panel).getByRole("button", { name: /Install app/i })).toBeInTheDocument();
    expect(within(panel).queryByRole("button", { name: /Main menu/i })).not.toBeInTheDocument();
  });

  it("toggles runtime feedback from the tools submenu before inspecteur", () => {
    const props = createProps({
      runtimeFeedbackVisible: false
    });

    render(<ShellMenu {...props} />);

    fireEvent.click(screen.getByRole("button", { name: /Tools/i }));
    fireEvent.click(screen.getByRole("button", { name: /Runtime feedback/i }));

    expect(props.onToggleRuntimeFeedback).toHaveBeenCalledTimes(1);
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("returns to Session and resets submenu navigation when the menu closes", () => {
    const props = createProps();
    const { rerender } = render(<ShellMenu {...props} />);

    fireEvent.click(screen.getByRole("button", { name: /View/i }));
    expect(screen.getByRole("button", { name: /Back to Session/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Back to Session/i }));
    expect(screen.getByRole("button", { name: /Main menu/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Tools/i }));
    rerender(<ShellMenu {...props} isOpen={false} />);
    rerender(<ShellMenu {...props} isOpen />);

    expect(screen.getByRole("button", { name: /Main menu/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Back to Session/i })).not.toBeInTheDocument();
  });

  it("uses Escape to step back from submenus before closing the deck", () => {
    const props = createProps();

    render(<ShellMenu {...props} />);

    fireEvent.click(screen.getByRole("button", { name: /View/i }));
    fireEvent.keyDown(window, { key: "Escape" });

    expect(screen.getByRole("button", { name: /Main menu/i })).toBeInTheDocument();
    expect(props.onOpenChange).not.toHaveBeenCalled();
  });

  it("uses Escape to close the deck from the root screen", () => {
    const props = createProps();

    render(<ShellMenu {...props} />);

    fireEvent.keyDown(window, { key: "Escape" });

    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("routes main-menu navigation through the session root actions", () => {
    const props = createProps();

    render(<ShellMenu {...props} />);

    fireEvent.click(screen.getByRole("button", { name: /Main menu/i }));

    expect(props.onShowMainMenuScene).toHaveBeenCalledTimes(1);
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("surfaces abandon run directly from the session menu while live", () => {
    const props = createProps();

    render(<ShellMenu {...props} />);

    fireEvent.click(screen.getByRole("button", { name: /Abandon run/i }));

    expect(props.onAbandonRun).toHaveBeenCalledTimes(1);
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("renders a compact stateful menu trigger and contextual header for the live runtime", () => {
    const props = createProps({
      isOpen: false
    });

    render(<ShellMenu {...props} />);

    expect(screen.getByRole("button", { name: /Menu/i })).toHaveTextContent("Live");
  });

  it("uses the renamed shell labels for main-menu and progression scenes", () => {
    const { rerender } = render(<ShellMenu {...createProps({ activeScene: "main-menu" })} />);

    expect(screen.getByText("Emberwake")).toBeInTheDocument();
    expect(screen.getAllByText("Main menu").length).toBeGreaterThan(0);

    rerender(<ShellMenu {...createProps({ activeScene: "growth" })} />);

    expect(screen.getAllByText("Talents").length).toBeGreaterThan(0);
  });

  it("keeps the primary action aligned with the paused shell scene without the removed context panel", () => {
    const props = createProps({
      activeScene: "pause"
    });

    render(<ShellMenu {...props} />);

    expect(screen.getByRole("button", { name: /Resume runtime/i })).toBeInTheDocument();
    expect(screen.queryByText("Session pause")).not.toBeInTheDocument();
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

  it("opens the live shell menu on mobile instead of routing to the pause scene", () => {
    const props = createProps({
      isOpen: false,
      layoutMode: "mobile"
    });

    render(<ShellMenu {...props} />);

    fireEvent.click(screen.getByRole("button", { name: /Menu/i }));

    expect(props.onOpenChange).toHaveBeenCalledWith(true);
    expect(props.onShowPauseScene).not.toHaveBeenCalled();
  });
});
