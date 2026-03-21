import "./PlayerHudCard.css";

type PlayerHudCardProps = {
  playerName: string;
  isMobile: boolean;
  movementHintVisible: boolean;
  movementSummary: string;
};

export function PlayerHudCard({
  playerName,
  isMobile,
  movementHintVisible,
  movementSummary
}: PlayerHudCardProps) {
  return (
    <section className="player-hud" aria-label="Player HUD" data-testid="player-hud">
      <p className="player-hud__eyebrow">Runtime feedback</p>
      <div className="player-hud__row">
        <span>Session</span>
        <strong>{playerName}</strong>
      </div>
      <div className="player-hud__row">
        <span>Controls</span>
        <strong>{isMobile ? "Drag to steer" : movementSummary}</strong>
      </div>
      {movementHintVisible ? (
        <p className="player-hud__hint" data-testid="player-hud-hint">
          {isMobile
            ? "Glissez pour guider le deplacement."
            : `Use ${movementSummary} to move.`}
        </p>
      ) : (
        <p className="player-hud__hint player-hud__hint--resolved" data-testid="player-hud-hint">
          Movement acknowledged.
        </p>
      )}
    </section>
  );
}
