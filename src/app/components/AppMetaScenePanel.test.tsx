import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { AppMetaScenePanel } from "./AppMetaScenePanel";
import { createDefaultDesktopControlBindings } from "../../game/input/model/singleEntityControlContract";

const createProps = (overrides: Partial<React.ComponentProps<typeof AppMetaScenePanel>> = {}) => ({
  canResumeSession: false,
  canSaveSession: false,
  characterNameError: null,
  desktopControlBindings: createDefaultDesktopControlBindings(),
  fullscreenPreferred: false,
  gameOverRecap: null,
  isShellMenuOpen: false,
  isLoadAvailable: false,
  onApplyDesktopControlBindings: vi.fn(),
  onBeginNewGame: vi.fn(),
  onCharacterNameChange: vi.fn(),
  onLoadGame: vi.fn(),
  onOpenChangelogs: vi.fn(),
  onOpenNewGame: vi.fn(),
  onOpenSettings: vi.fn(),
  onReturnToMainMenu: vi.fn(),
  onResumeRuntime: vi.fn(),
  onSaveGame: vi.fn(),
  pendingCharacterName: "Wanderer",
  playerName: "",
  runtimeOutcome: null,
  scene: "runtime" as const,
  ...overrides
});

describe("AppMetaScenePanel", () => {
  it("stays hidden outside shell-owned meta scenes", () => {
    const { container } = render(<AppMetaScenePanel {...createProps()} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders the main menu hub before runtime start", () => {
    const props = createProps({
      scene: "main-menu"
    });

    render(<AppMetaScenePanel {...props} />);

    expect(screen.getByLabelText("Main menu")).toBeInTheDocument();
    const actionButtons = screen.getAllByRole("button");
    const loadGameIndex = actionButtons.findIndex((button) => button.textContent?.match(/Load game/i));
    const newGameIndex = actionButtons.findIndex((button) => button.textContent?.match(/Start new game/i));
    expect(screen.getByRole("button", { name: /Start new game/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Load game/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Changelogs/i })).toBeInTheDocument();
    expect(screen.queryByText(/Meta flow/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Session$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Resume the run, start a new one/i)).not.toBeInTheDocument();
    expect(screen.queryByText("No save available")).not.toBeInTheDocument();
    expect(screen.queryByText("Ownership")).not.toBeInTheDocument();
    expect(loadGameIndex).toBeGreaterThan(-1);
    expect(newGameIndex).toBeGreaterThan(loadGameIndex);
    expect(screen.getByRole("link", { name: /Emberwake v0\.3\.2/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Settings/i }));
    expect(props.onOpenSettings).toHaveBeenCalledTimes(1);
  });

  it("surfaces save and load actions when the menu has an active or persisted session", () => {
    const props = createProps({
      canResumeSession: true,
      canSaveSession: true,
      isLoadAvailable: true,
      scene: "main-menu"
    });

    render(<AppMetaScenePanel {...props} />);

    fireEvent.click(screen.getByRole("button", { name: /Save game/i }));
    fireEvent.click(screen.getByRole("button", { name: /Load game/i }));

    expect(props.onSaveGame).toHaveBeenCalledTimes(1);
    expect(props.onLoadGame).toHaveBeenCalledTimes(1);
  });

  it("maps Escape to Resume runtime from the main menu when that action is available", () => {
    const props = createProps({
      canResumeSession: true,
      scene: "main-menu"
    });

    render(<AppMetaScenePanel {...props} />);

    fireEvent.keyDown(window, { key: "Escape" });

    expect(props.onResumeRuntime).toHaveBeenCalledTimes(1);
  });

  it("renders the new-game naming step and gates Begin on invalid input", () => {
    const props = createProps({
      characterNameError: "Enter a character name.",
      pendingCharacterName: " ",
      scene: "new-game"
    });

    render(<AppMetaScenePanel {...props} />);

    expect(screen.getByLabelText("New game")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Begin/i })).toBeDisabled();
    const actionButtons = screen.getAllByRole("button");
    const beginIndex = actionButtons.findIndex((button) => button.textContent?.match(/^Begin$/i));
    const backIndex = actionButtons.findIndex((button) => button.textContent?.match(/Back to menu/i));
    expect(beginIndex).toBeGreaterThan(-1);
    expect(backIndex).toBeGreaterThan(beginIndex);
    fireEvent.change(screen.getByLabelText(/Character name/i), {
      target: { value: "Ash" }
    });

    expect(props.onCharacterNameChange).toHaveBeenCalledWith("Ash");
  });

  it("routes Escape through Back actions for settings when the shell menu is closed", () => {
    const props = createProps({
      scene: "settings"
    });

    render(<AppMetaScenePanel {...props} />);

    fireEvent.keyDown(window, { key: "Escape" });

    expect(props.onReturnToMainMenu).toHaveBeenCalledTimes(1);
  });

  it("renders the changelog reader scene and routes back to the main menu", () => {
    const props = createProps({
      scene: "changelogs"
    });

    render(<AppMetaScenePanel {...props} />);

    expect(screen.getByLabelText("Changelogs")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "0.3.2" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { name: /Highlights/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("heading", { name: /Technical Notes/i }).length).toBeGreaterThan(0);
    expect(screen.queryByText(/without leaving the shell/i)).not.toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });

    expect(props.onReturnToMainMenu).toHaveBeenCalledTimes(1);
  });

  it("lets local input focus absorb Escape instead of navigating away", () => {
    const props = createProps({
      scene: "new-game"
    });

    render(<AppMetaScenePanel {...props} />);

    const input = screen.getByLabelText(/Character name/i);
    input.focus();
    fireEvent.keyDown(input, { key: "Escape" });

    expect(props.onReturnToMainMenu).not.toHaveBeenCalled();
  });

  it("stays hidden for the removed pause overlay surface", () => {
    const { container } = render(
      <AppMetaScenePanel {...createProps({ scene: "pause" })} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders settings as a compact desktop-controls surface", () => {
    const props = createProps({
      canResumeSession: true,
      scene: "settings"
    });

    render(<AppMetaScenePanel {...props} />);

    expect(screen.getByLabelText("Settings")).toBeInTheDocument();
    expect(screen.queryByText(/Tune desktop controls/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Session")).not.toBeInTheDocument();
    expect(screen.queryByText("Fullscreen")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Resume runtime/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Loading desktop control bindings/i)).toBeInTheDocument();
  });

  it("renders gameplay outcomes through shell-owned meta scenes", () => {
    render(
      <AppMetaScenePanel
        {...createProps({
          runtimeOutcome: {
            detail: "Traversal goal reached without shell-owned defeat handling leaking into gameplay internals.",
            emittedAtTick: 42,
            kind: "victory",
            shellScene: "victory"
          },
          scene: "victory"
        })}
      />
    );

    expect(screen.getByLabelText("Victory")).toBeInTheDocument();
    expect(screen.getByText(/Traversal goal reached/i)).toBeInTheDocument();
    expect(screen.getByText(/gameplay outcome victory/i)).toBeInTheDocument();
  });

  it("renders a game-over recap and routes back to the main menu", () => {
    const props = createProps({
      gameOverRecap: {
        defeatDetail: "The hostile swarm overran the active run.",
        goldCollected: 7,
        hostileDefeats: 3,
        playerName: "Wanderer",
        ticksSurvived: 9000,
        traversalDistanceWorldUnits: 420
      },
      runtimeOutcome: {
        detail: "The hostile swarm overran the active run.",
        emittedAtTick: 9000,
        kind: "defeat",
        shellScene: "defeat"
      },
      scene: "defeat"
    });

    render(<AppMetaScenePanel {...props} />);

    expect(screen.getByLabelText("Game over")).toBeInTheDocument();
    expect(screen.getByText("2:30")).toBeInTheDocument();
    expect(screen.getByText("420 wu")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Resume runtime/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Back to main menu/i }));
    expect(props.onReturnToMainMenu).toHaveBeenCalledTimes(1);
  });
});
