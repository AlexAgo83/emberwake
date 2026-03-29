import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { AppMetaScenePanel } from "./AppMetaScenePanel";
import { createDefaultMetaProfile } from "../model/metaProgression";
import { createDefaultDesktopControlBindings } from "../../game/input/model/singleEntityControlContract";
import { appConfig } from "../../shared/config/appConfig";

const createProps = (overrides: Partial<React.ComponentProps<typeof AppMetaScenePanel>> = {}) => ({
  biomeSeamsVisible: false,
  canResumeSession: false,
  characterNameError: null,
  desktopControlBindings: createDefaultDesktopControlBindings(),
  entityRingsVisible: false,
  fullscreenPreferred: false,
  gameOverRecap: null,
  isMobileLayout: false,
  isShellMenuOpen: false,
  metaProfile: createDefaultMetaProfile(),
  onAbandonRun: vi.fn(),
  onApplyDesktopControlBindings: vi.fn(),
  onBeginNewGame: vi.fn(),
  onOpenBestiary: vi.fn(),
  onCharacterNameChange: vi.fn(),
  onOpenChangelogs: vi.fn(),
  onOpenGrowth: vi.fn(),
  onOpenGrimoire: vi.fn(),
  onOpenLootArchive: vi.fn(),
  onOpenNewGame: vi.fn(),
  onPurchaseShopUnlock: vi.fn(),
  onPurchaseTalentRank: vi.fn(),
  onOpenSettings: vi.fn(),
  onReturnToMainMenu: vi.fn(),
  onResumeRuntime: vi.fn(),
  onSelectWorldProfile: vi.fn(),
  onSetBiomeSeamsVisible: vi.fn(),
  onSetEntityRingsVisible: vi.fn(),
  pendingCharacterName: "Wanderer",
  playerName: "",
  progressionSnapshot: null,
  runtimeOutcome: null,
  scene: "runtime" as const,
  selectedWorldProfileId: "ashwake-verge" as const,
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

    expect(screen.getByLabelText("Emberwake")).toBeInTheDocument();
    const actionButtons = screen.getAllByRole("button");
    const newGameIndex = actionButtons.findIndex((button) =>
      button.textContent?.match(/Descend into the Abyss/i)
    );
    expect(screen.getByRole("button", { name: /Descend into the Abyss/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Skills/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Bestiary/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Loot Archive/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Changelogs/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Talents/i })).toBeInTheDocument();
    expect(screen.queryByText(/Meta flow/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Session$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Resume the run, start a new one/i)).not.toBeInTheDocument();
    expect(screen.queryByText("No save available")).not.toBeInTheDocument();
    expect(screen.queryByText("Ownership")).not.toBeInTheDocument();
    expect(newGameIndex).toBeGreaterThan(-1);
    const settingsIndex = actionButtons.findIndex((button) => button.textContent?.match(/^Settings$/i));
    const talentsIndex = actionButtons.findIndex((button) => button.textContent?.match(/^Talents$/i));
    expect(settingsIndex).toBeGreaterThan(-1);
    expect(talentsIndex).toBeGreaterThan(settingsIndex);
    expect(
      screen.getByRole("link", { name: new RegExp(`Emberwake v${appConfig.version}`, "i") })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Settings/i }));
    expect(props.onOpenSettings).toHaveBeenCalledTimes(1);
  });

  it("surfaces resume without exposing the removed save-load actions", () => {
    const props = createProps({
      canResumeSession: true,
      scene: "main-menu"
    });

    render(<AppMetaScenePanel {...props} />);

    expect(screen.getByRole("button", { name: /Resume runtime/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Save game/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Load game/i })).not.toBeInTheDocument();
  });

  it("renders the growth scene with shop and talent purchases", async () => {
    const props = createProps({
      metaProfile: {
        ...createDefaultMetaProfile(),
        purchasedShopUnlockIds: ["second-wave-skills"],
        talentRanks: {
          ...createDefaultMetaProfile().talentRanks,
          "gold-gain": 1,
          "max-health": 1
        },
        goldBalance: 99
      },
      scene: "growth"
    });

    render(<AppMetaScenePanel {...props} />);

    expect(screen.getByRole("heading", { name: "Talents" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Available gold/i)).toBeInTheDocument();
    expect(screen.getByText("99")).toBeInTheDocument();
    expect(await screen.findByText("1/5 owned • 20% complete")).toBeInTheDocument();
    expect(screen.getByText("Owned effect: +12%")).toBeInTheDocument();
    expect(screen.getByText("Next rank adds: +12% (to +24% total)")).toBeInTheDocument();
    expect(screen.getByText("Owned effect: +12 HP")).toBeInTheDocument();
    expect(screen.getByText("Next rank adds: +12 HP (to +24 HP total)")).toBeInTheDocument();
    fireEvent.click((await screen.findAllByRole("button", { name: /Unlock|Buy rank/i }))[0]!);

    expect(props.onPurchaseShopUnlock).toHaveBeenCalledTimes(1);
  });

  it("disables talent purchases when the player does not have enough gold", async () => {
    const props = createProps({
      metaProfile: {
        ...createDefaultMetaProfile(),
        goldBalance: 0
      },
      scene: "growth"
    });

    render(<AppMetaScenePanel {...props} />);

    expect(screen.getByRole("heading", { name: "Talents" })).toBeInTheDocument();
    const buyRankButtons = await screen.findAllByRole("button", { name: /Buy rank/i });

    expect(buyRankButtons.length).toBeGreaterThan(0);
    for (const button of buyRankButtons) {
      expect(button).toBeDisabled();
      fireEvent.click(button);
    }
    expect(props.onPurchaseTalentRank).not.toHaveBeenCalled();
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

  it("renders the new-game naming step, world cards, and gates Begin on invalid input", () => {
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
    expect(screen.getByRole("button", { name: /Ashwake Verge/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Progress 0\/3/i).length).toBeGreaterThan(0);
    fireEvent.change(screen.getByLabelText(/Character name/i), {
      target: { value: "Ash" }
    });

    expect(props.onCharacterNameChange).toHaveBeenCalledWith("Ash");
  });

  it("selects unlocked worlds and keeps locked worlds unavailable", () => {
    const props = createProps({
      metaProfile: {
        ...createDefaultMetaProfile(),
        worldProgress: {
          ...createDefaultMetaProfile().worldProgress,
          "emberplain-reach": {
            ...createDefaultMetaProfile().worldProgress["emberplain-reach"],
            isUnlocked: false
          }
        }
      },
      scene: "new-game"
    });

    render(<AppMetaScenePanel {...props} />);

    fireEvent.click(screen.getByRole("button", { name: /Ashwake Verge/i }));

    expect(props.onSelectWorldProfile).toHaveBeenCalledWith("ashwake-verge");
    expect(screen.getByRole("button", { name: /Emberplain Reach/i })).toBeDisabled();
  });

  it("routes Escape through Back actions for settings when the shell menu is closed", () => {
    const props = createProps({
      scene: "settings"
    });

    render(<AppMetaScenePanel {...props} />);

    fireEvent.keyDown(window, { key: "Escape" });

    expect(props.onReturnToMainMenu).toHaveBeenCalledTimes(1);
  });

  it("renders the changelog reader scene and routes back to the main menu", async () => {
    const props = createProps({
      scene: "changelogs"
    });

    render(<AppMetaScenePanel {...props} />);

    expect(screen.getByLabelText("Changelogs")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: appConfig.version })).toBeInTheDocument();
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

  it("renders the pause scene as a full-screen paused surface", () => {
    const props = createProps({ scene: "pause" });

    render(<AppMetaScenePanel {...props} />);

    expect(screen.getByLabelText("Paused")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Resume runtime/i }));
    expect(props.onResumeRuntime).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: /Abandon run/i }));
    expect(props.onAbandonRun).toHaveBeenCalledTimes(1);
  });

  it("renders settings as a category menu before opening sub-surfaces", async () => {
    const props = createProps({
      canResumeSession: true,
      scene: "settings"
    });

    render(<AppMetaScenePanel {...props} />);

    expect(screen.getByLabelText("Settings")).toBeInTheDocument();
    expect(screen.queryByText("Session")).not.toBeInTheDocument();
    expect(screen.queryByText("Fullscreen")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Resume runtime/i })).not.toBeInTheDocument();
    expect(await screen.findByRole("button", { name: "Controls" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Display" })).toBeInTheDocument();
    expect(screen.queryByLabelText(/Desktop controls/i)).not.toBeInTheDocument();
  });

  it("opens desktop controls from the settings menu on large layouts", async () => {
    const props = createProps({
      scene: "settings"
    });

    render(<AppMetaScenePanel {...props} />);

    fireEvent.click(screen.getByRole("button", { name: "Controls" }));

    expect(await screen.findByLabelText(/Desktop controls/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Back to settings/i })).toBeInTheDocument();
  });

  it("returns from a settings child surface to the settings menu on Escape", async () => {
    const props = createProps({
      scene: "settings"
    });

    render(<AppMetaScenePanel {...props} />);
    fireEvent.click(await screen.findByRole("button", { name: "Display" }));

    expect(await screen.findByRole("button", { name: /Enable debug circles/i })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });

    expect(await screen.findByRole("button", { name: "Controls" })).toBeInTheDocument();
    expect(props.onReturnToMainMenu).not.toHaveBeenCalled();
  });

  it("toggles display helpers from the graphics settings surface", async () => {
    const props = createProps({
      biomeSeamsVisible: false,
      entityRingsVisible: false,
      scene: "settings"
    });

    render(<AppMetaScenePanel {...props} />);
    fireEvent.click(await screen.findByRole("button", { name: "Display" }));
    fireEvent.click(await screen.findByRole("button", { name: /Enable debug circles/i }));
    fireEvent.click(await screen.findByRole("button", { name: /Enable biome transitions/i }));

    expect(props.onSetEntityRingsVisible).toHaveBeenCalledWith(true);
    expect(props.onSetBiomeSeamsVisible).toHaveBeenCalledWith(true);
  });

  it("keeps desktop controls unavailable but exposes graphics on the mobile settings surface", async () => {
    const props = createProps({
      isMobileLayout: true,
      scene: "settings"
    });

    render(<AppMetaScenePanel {...props} />);

    expect((await screen.findByRole("button", { name: "Controls" }))).toBeDisabled();
    expect(screen.getByRole("button", { name: "Display" })).toBeEnabled();
    expect(screen.getByText(/Desktop control calibration is only exposed on large-screen shell layouts/i)).toBeInTheDocument();
    expect(screen.queryByText(/Loading desktop control bindings/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Desktop controls/i)).not.toBeInTheDocument();
  });

  it("renders gameplay outcomes through shell-owned meta scenes", () => {
    render(
      <AppMetaScenePanel
        {...createProps({
          gameOverRecap: {
            defeatDetail: "Traversal goal reached without shell-owned defeat handling leaking into gameplay internals.",
            goldCollected: 12,
            hostileDefeats: 19,
            playerName: "Wanderer",
            runPhaseLabel: "Kill Grid",
            skillPerformanceSummaries: [
              {
                attacksTriggered: 14,
                fusionId: null,
                hostileDefeats: 6,
                label: "Ash Lash",
                totalDamage: 420,
                weaponId: "ash-lash"
              }
            ],
            ticksSurvived: 3600,
            traversalDistanceWorldUnits: 12800
          },
          runtimeOutcome: {
            detail: "Traversal goal reached without shell-owned defeat handling leaking into gameplay internals.",
            emittedAtTick: 42,
            kind: "victory",
            phaseId: null,
            shellScene: "victory",
            skillPerformanceSummaries: [
              {
                attacksTriggered: 14,
                fusionId: null,
                hostileDefeats: 6,
                label: "Ash Lash",
                totalDamage: 420,
                weaponId: "ash-lash"
              }
            ]
          },
          scene: "victory"
        })}
      />
    );

    expect(screen.getByLabelText("Victory")).toBeInTheDocument();
    expect(screen.getByText(/Traversal goal reached/i)).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Recap/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Skill ranking/i })).toBeInTheDocument();
    expect(screen.getByText("Wanderer")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Back to main menu/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Continue runtime/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Settings/i })).not.toBeInTheDocument();
  });

  it("renders a game-over recap and routes back to the main menu", () => {
    const props = createProps({
      gameOverRecap: {
        defeatDetail: "The hostile swarm overran the active run.",
        goldCollected: 7,
        hostileDefeats: 3,
        playerName: "Wanderer",
        runPhaseLabel: "Black Rain",
        skillPerformanceSummaries: [
          {
            attacksTriggered: 8,
            fusionId: null,
            hostileDefeats: 2,
            label: "Ash Lash",
            totalDamage: 75,
            weaponId: "ash-lash"
          },
          {
            attacksTriggered: 4,
            fusionId: null,
            hostileDefeats: 1,
            label: "Orbit Sutra",
            totalDamage: 25,
            weaponId: "orbit-sutra"
          }
        ],
        ticksSurvived: 9000,
        traversalDistanceWorldUnits: 420
      },
      runtimeOutcome: {
        detail: "The hostile swarm overran the active run.",
        emittedAtTick: 9000,
        kind: "defeat",
        phaseId: "black-rain",
        shellScene: "defeat",
        skillPerformanceSummaries: []
      },
      scene: "defeat"
    });

    render(<AppMetaScenePanel {...props} />);

    expect(screen.getByLabelText("Game over")).toBeInTheDocument();
    expect(screen.getByText("2:30")).toBeInTheDocument();
    expect(screen.getByText("420 wu")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Resume runtime/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: /Skill ranking/i }));
    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(screen.getByText("25%")).toBeInTheDocument();
    expect(screen.getByText("Ash Lash").closest("article")).toHaveStyle("--damage-share: 75%");

    fireEvent.click(screen.getByRole("button", { name: /Back to main menu/i }));
    expect(props.onReturnToMainMenu).toHaveBeenCalledTimes(1);
  });
});
