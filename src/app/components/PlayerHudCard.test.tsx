import { render, screen } from "@testing-library/react";

import { PlayerHudCard } from "./PlayerHudCard";

describe("PlayerHudCard", () => {
  it("renders a compact runtime feedback card for desktop controls", () => {
    render(
      <PlayerHudCard
        fps={58.7}
        isMobile={false}
        playerName="Wanderer"
      />
    );

    expect(screen.getByTestId("player-hud")).toBeInTheDocument();
    expect(screen.getByText("Wanderer")).toBeInTheDocument();
    expect(screen.getByText("59")).toBeInTheDocument();
    expect(screen.queryByText(/WASD \/ arrows/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId("player-hud-hint")).not.toBeInTheDocument();
  });

  it("shows only the compact hint on mobile", () => {
    render(
      <PlayerHudCard
        fps={61.2}
        isMobile
        playerName="Ash"
      />
    );

    expect(screen.getByText("Glissez pour guider le deplacement.")).toBeInTheDocument();
  });
});
