import { render, screen } from "@testing-library/react";

import { PlayerHudCard } from "./PlayerHudCard";

describe("PlayerHudCard", () => {
  it("renders a compact runtime feedback card for desktop controls", () => {
    render(
      <PlayerHudCard
        fps={58.7}
        isMobile={false}
        playerHealth={87}
        playerName="Wanderer"
        zoomMultiplier={1.25}
      />
    );

    expect(screen.getByTestId("player-hud")).toBeInTheDocument();
    expect(screen.getByText("Wanderer")).toBeInTheDocument();
    expect(screen.getByText("87")).toBeInTheDocument();
    expect(screen.getByText("59")).toBeInTheDocument();
    expect(screen.getByText("1.25x")).toBeInTheDocument();
    expect(screen.queryByText(/WASD \/ arrows/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId("player-hud-hint")).not.toBeInTheDocument();
  });

  it("shows only the compact hint on mobile", () => {
    render(
      <PlayerHudCard
        fps={61.2}
        isMobile
        playerHealth={42}
        playerName="Ash"
        zoomMultiplier={0.8}
      />
    );

    expect(screen.getByText("Glissez pour guider le deplacement.")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("0.80x")).toBeInTheDocument();
  });
});
