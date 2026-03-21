import { render, screen } from "@testing-library/react";

import { PlayerHudCard } from "./PlayerHudCard";

describe("PlayerHudCard", () => {
  it("renders a compact runtime feedback card for desktop controls", () => {
    render(
      <PlayerHudCard
        isMobile={false}
        movementHintVisible
        movementSummary="WASD / arrows"
        playerName="Wanderer"
      />
    );

    expect(screen.getByTestId("player-hud")).toBeInTheDocument();
    expect(screen.getByText("Wanderer")).toBeInTheDocument();
    expect(screen.getByText("WASD / arrows")).toBeInTheDocument();
    expect(screen.getByText("Use WASD / arrows to move.")).toBeInTheDocument();
  });

  it("switches to the resolved onboarding state after movement is acknowledged", () => {
    render(
      <PlayerHudCard
        isMobile
        movementHintVisible={false}
        movementSummary="WASD / arrows"
        playerName="Ash"
      />
    );

    expect(screen.getByText("Movement acknowledged.")).toBeInTheDocument();
  });
});
