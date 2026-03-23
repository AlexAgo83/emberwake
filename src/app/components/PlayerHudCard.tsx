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
  const roundedLevel = Math.max(1, Math.round(currentLevel));
  const roundedHealth = Math.max(0, Math.round(playerHealth));
  const roundedXp = Math.max(0, Math.round(currentXp));
  const roundedNextLevelXp = Math.max(1, Math.round(nextLevelXpRequired));
  const xpProgressPercent = Math.min(100, Math.round((roundedXp / roundedNextLevelXp) * 100));

  return (
    <section className="player-hud" aria-label="Player HUD" data-testid="player-hud">
      <div className="player-hud__header">
        <div>
          <p className="player-hud__eyebrow">Field status</p>
          <p className="player-hud__name">{playerName}</p>
        </div>
        <p className="player-hud__level-chip">Lv {roundedLevel}</p>
      </div>

      <div className="player-hud__rail">
        <div className="player-hud__rail-header">
          <span>HP</span>
          <strong>{roundedHealth}</strong>
        </div>
        <div className="player-hud__bar" aria-hidden="true">
          <span className="player-hud__bar-fill player-hud__bar-fill--health" style={{ width: `${Math.min(100, roundedHealth)}%` }} />
        </div>
      </div>

      <div className="player-hud__rail">
        <div className="player-hud__rail-header">
          <span>XP</span>
          <strong>
            {roundedXp} / {roundedNextLevelXp}
          </strong>
        </div>
        <div className="player-hud__bar" aria-hidden="true">
          <span
            className="player-hud__bar-fill player-hud__bar-fill--xp"
            style={{ width: `${xpProgressPercent}%` }}
          />
        </div>
      </div>

      <div className="player-hud__metrics">
        <div className="player-hud__metric">
          <span>Level</span>
          <strong>{roundedLevel}</strong>
        </div>
        <div className="player-hud__metric">
          <span>Gold</span>
          <strong>{Math.max(0, Math.round(goldCollected))}</strong>
        </div>
        <div className="player-hud__metric">
          <span>FPS</span>
          <strong>{Math.max(0, Math.round(fps))}</strong>
        </div>
        <div className="player-hud__metric">
          <span>Zoom</span>
          <strong>{zoomMultiplier.toFixed(2)}x</strong>
        </div>
      </div>

      {isMobile ? (
        <p className="player-hud__hint" data-testid="player-hud-hint">
          Glissez pour guider le deplacement.
        </p>
      ) : null}
    </section>
  );
}
