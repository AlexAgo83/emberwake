import { render, screen } from "@testing-library/react";

import { PlayerHudCard } from "./PlayerHudCard";

describe("PlayerHudCard", () => {
  it("renders a compact runtime feedback card for desktop controls", () => {
    render(
      <PlayerHudCard
        buildActives={[
          {
            id: "ash-lash",
            isFused: false,
            isFusionReady: false,
            label: "Ash Lash",
            level: 1,
            maxLevel: 8
          }
        ]}
        buildPassives={[
          {
            id: "overclock-seal",
            label: "Overclock Seal",
            level: 1,
            maxLevel: 5
          }
        ]}
        currentLevel={3}
        currentXp={45}
        fps={58.7}
        goldCollected={14}
        isMobile={false}
        nextLevelXpRequired={150}
        phaseLabel="Veil Break"
        playerHealth={87}
        playerHealthMax={100}
        playerName="Wanderer"
        playerPosition={{ x: 128, y: -64 }}
      />
    );

    expect(screen.getByTestId("player-hud")).toBeInTheDocument();
    expect(screen.getByText("Wanderer")).toBeInTheDocument();
    expect(screen.getByText("Level 3")).toBeInTheDocument();
    expect(screen.getAllByText("87 / 100").length).toBeGreaterThan(0);
    expect(screen.getAllByText("45 / 150").length).toBeGreaterThan(0);
    expect(screen.getByText("14")).toBeInTheDocument();
    expect(screen.getByText("128, -64")).toBeInTheDocument();
    expect(screen.getByText("FPS 59")).toBeInTheDocument();
    expect(screen.getByText("Actives")).toBeInTheDocument();
    expect(screen.getByText("Passives")).toBeInTheDocument();
    expect(screen.getByTitle("Ash Lash Lv 1/8")).toBeInTheDocument();
    expect(screen.getByTitle("Overclock Seal Lv 1/5")).toBeInTheDocument();
    expect(screen.queryByText(/WASD \/ arrows/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId("player-hud-hint")).not.toBeInTheDocument();
  });

  it("keeps the mobile HUD compact without an extra movement hint", () => {
    render(
      <PlayerHudCard
        currentLevel={2}
        currentXp={10}
        fps={61.2}
        goldCollected={3}
        isMobile
        nextLevelXpRequired={150}
        phaseLabel="Ember Watch"
        playerHealth={42}
        playerHealthMax={100}
        playerName="Ash"
        playerPosition={{ x: 10, y: 20 }}
      />
    );

    expect(screen.getByText("Level 2")).toBeInTheDocument();
    expect(screen.getAllByText("42 / 100").length).toBeGreaterThan(0);
    expect(screen.getAllByText("10 / 150").length).toBeGreaterThan(0);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("10, 20")).toBeInTheDocument();
    expect(screen.queryByTestId("player-hud-hint")).not.toBeInTheDocument();
  });
});
