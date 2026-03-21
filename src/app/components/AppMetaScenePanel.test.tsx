import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { AppMetaScenePanel } from "./AppMetaScenePanel";

const createProps = (overrides: Partial<React.ComponentProps<typeof AppMetaScenePanel>> = {}) => ({
  canResumeSession: false,
  characterNameError: null,
  fullscreenPreferred: false,
  isLoadAvailable: false,
  onBeginNewGame: vi.fn(),
  onCharacterNameChange: vi.fn(),
  onOpenNewGame: vi.fn(),
  onOpenSettings: vi.fn(),
  onReturnToMainMenu: vi.fn(),
  onResumeRuntime: vi.fn(),
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
    expect(screen.getByRole("button", { name: /Start new game/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Load game/i })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /Settings/i }));
    expect(props.onOpenSettings).toHaveBeenCalledTimes(1);
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
    fireEvent.change(screen.getByLabelText(/Character name/i), {
      target: { value: "Ash" }
    });

    expect(props.onCharacterNameChange).toHaveBeenCalledWith("Ash");
  });

  it("renders pause metadata and resumes the runtime on demand", () => {
    const props = createProps({
      fullscreenPreferred: true,
      onResumeRuntime: vi.fn(),
      scene: "pause"
    });

    render(<AppMetaScenePanel {...props} />);

    expect(screen.getByLabelText("Runtime paused")).toBeInTheDocument();
    expect(screen.getByText("remembered")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Resume runtime/i }));

    expect(props.onResumeRuntime).toHaveBeenCalledTimes(1);
  });

  it("renders settings details while keeping runtime re-entry available", () => {
    render(
      <AppMetaScenePanel
        {...createProps({
          scene: "settings"
        })}
      />
    );

    expect(screen.getByLabelText("Settings")).toBeInTheDocument();
    expect(screen.getByText(/Returning to runtime resumes the live loop/i)).toBeInTheDocument();
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
});
