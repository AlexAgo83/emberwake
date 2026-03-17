type PlayerHudCardProps = {
  isMobile: boolean;
  movementHintVisible: boolean;
  selectedEntityLabel: string;
};

export function PlayerHudCard({
  isMobile,
  movementHintVisible,
  selectedEntityLabel
}: PlayerHudCardProps) {
  return (
    <section className="player-hud" aria-label="Player HUD">
      <p className="player-hud__eyebrow">Movement-first loop</p>
      <div className="player-hud__row">
        <span>Focus</span>
        <strong>{selectedEntityLabel}</strong>
      </div>
      <div className="player-hud__row">
        <span>Controls</span>
        <strong>{isMobile ? "Drag to steer" : "WASD / arrows"}</strong>
      </div>
      {movementHintVisible ? (
        <p className="player-hud__hint">
          {isMobile
            ? "Glissez pour deplacer l'entitee."
            : "Utilisez WASD ou les fleches pour deplacer l'entitee."}
        </p>
      ) : (
        <p className="player-hud__hint player-hud__hint--resolved">Movement acknowledged.</p>
      )}
    </section>
  );
}
