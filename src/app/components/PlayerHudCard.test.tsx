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
      />
    );

    expect(screen.getByTestId("player-hud")).toBeInTheDocument();
    expect(screen.getByText("Wanderer")).toBeInTheDocument();
    expect(screen.getByText("Lv 3")).toBeInTheDocument();
    expect(screen.getByText("Veil Break")).toBeInTheDocument();
    expect(screen.getByText("87 / 100")).toBeInTheDocument();
    expect(screen.getByText("45 / 150")).toBeInTheDocument();
    expect(screen.getByText("14")).toBeInTheDocument();
    expect(screen.getByText("FPS 59")).toBeInTheDocument();
    expect(screen.getByText("Actives")).toBeInTheDocument();
    expect(screen.getByText("Passives")).toBeInTheDocument();
    expect(screen.getByTitle("Ash Lash Lv 1/8")).toBeInTheDocument();
    expect(screen.getByTitle("Overclock Seal Lv 1/5")).toBeInTheDocument();
    expect(screen.queryByText(/WASD \/ arrows/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId("player-hud-hint")).not.toBeInTheDocument();
  });

  it("shows only the compact hint on mobile", () => {
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
      />
    );

    expect(screen.getByText("Glissez pour guider le deplacement.")).toBeInTheDocument();
    expect(screen.getByText("Lv 2")).toBeInTheDocument();
    expect(screen.getByText("42 / 100")).toBeInTheDocument();
    expect(screen.getByText("10 / 150")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
