import "./PlayerHudCard.css";

type PlayerHudCardProps = {
  fps: number;
  isMobile: boolean;
  playerName: string;
};

export function PlayerHudCard({
  fps,
  isMobile,
  playerName
}: PlayerHudCardProps) {
  return (
    <section className="player-hud" aria-label="Player HUD" data-testid="player-hud">
      <p className="player-hud__eyebrow">Runtime feedback</p>
      <div className="player-hud__row">
        <span>Session</span>
        <strong>{playerName}</strong>
      </div>
      <div className="player-hud__row">
        <span>FPS</span>
        <strong>{Math.max(0, Math.round(fps))}</strong>
      </div>
      {isMobile ? (
        <p className="player-hud__hint" data-testid="player-hud-hint">
          Glissez pour guider le deplacement.
        </p>
      ) : null}
    </section>
  );
}
