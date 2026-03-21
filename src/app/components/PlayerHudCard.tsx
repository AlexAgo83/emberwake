import "./PlayerHudCard.css";

type PlayerHudCardProps = {
  currentLevel: number;
  currentXp: number;
  fps: number;
  goldCollected: number;
  isMobile: boolean;
  nextLevelXpRequired: number;
  playerHealth: number;
  playerName: string;
  zoomMultiplier: number;
};

export function PlayerHudCard({
  currentLevel,
  currentXp,
  fps,
  goldCollected,
  isMobile,
  nextLevelXpRequired,
  playerHealth,
  playerName,
  zoomMultiplier
}: PlayerHudCardProps) {
  return (
    <section className="player-hud" aria-label="Player HUD" data-testid="player-hud">
      <p className="player-hud__eyebrow">Runtime feedback</p>
      <div className="player-hud__row">
        <span>Session</span>
        <strong>{playerName}</strong>
      </div>
      <div className="player-hud__row">
        <span>HP</span>
        <strong>{Math.max(0, Math.round(playerHealth))}</strong>
      </div>
      <div className="player-hud__row">
        <span>Level</span>
        <strong>{Math.max(1, Math.round(currentLevel))}</strong>
      </div>
      <div className="player-hud__row">
        <span>XP</span>
        <strong>
          {Math.max(0, Math.round(currentXp))} / {Math.max(1, Math.round(nextLevelXpRequired))}
        </strong>
      </div>
      <div className="player-hud__row">
        <span>Gold</span>
        <strong>{Math.max(0, Math.round(goldCollected))}</strong>
      </div>
      <div className="player-hud__row">
        <span>FPS</span>
        <strong>{Math.max(0, Math.round(fps))}</strong>
      </div>
      <div className="player-hud__row">
        <span>Zoom</span>
        <strong>{zoomMultiplier.toFixed(2)}x</strong>
      </div>
      {isMobile ? (
        <p className="player-hud__hint" data-testid="player-hud-hint">
          Glissez pour guider le deplacement.
        </p>
      ) : null}
    </section>
  );
}
