import { render, screen } from "@testing-library/react";

import { PlayerHudCard } from "./PlayerHudCard";

describe("PlayerHudCard", () => {
  it("renders a compact runtime feedback card for desktop controls", () => {
    render(
      <PlayerHudCard
        currentLevel={3}
        currentXp={45}
        fps={58.7}
        goldCollected={14}
        isMobile={false}
        nextLevelXpRequired={150}
        playerHealth={87}
        playerName="Wanderer"
        zoomMultiplier={1.25}
      />
    );

    expect(screen.getByTestId("player-hud")).toBeInTheDocument();
    expect(screen.getByText("Wanderer")).toBeInTheDocument();
    expect(screen.getByText("87")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("45 / 150")).toBeInTheDocument();
    expect(screen.getByText("14")).toBeInTheDocument();
    expect(screen.getByText("59")).toBeInTheDocument();
    expect(screen.getByText("1.25x")).toBeInTheDocument();
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
        playerHealth={42}
        playerName="Ash"
        zoomMultiplier={0.8}
      />
    );

    expect(screen.getByText("Glissez pour guider le deplacement.")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("10 / 150")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("0.80x")).toBeInTheDocument();
  });
});
