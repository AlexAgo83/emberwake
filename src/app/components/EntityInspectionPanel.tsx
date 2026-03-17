type EntityInspectionPanelProps = {
  entityChunk: string;
  entityId: string;
  entityLabel: string;
  entityPosition: string;
  entityState: string;
  isMobile: boolean;
};

export function EntityInspectionPanel({
  entityChunk,
  entityId,
  entityLabel,
  entityPosition,
  entityState,
  isMobile
}: EntityInspectionPanelProps) {
  return (
    <aside
      className={`inspection-panel${isMobile ? " inspection-panel--mobile" : ""}`}
      aria-label="Selected entity inspection"
    >
      <p className="inspection-panel__eyebrow">Inspection</p>
      <h2>{entityLabel}</h2>
      <dl className="inspection-panel__grid">
        <div>
          <dt>ID</dt>
          <dd>{entityId}</dd>
        </div>
        <div>
          <dt>State</dt>
          <dd>{entityState}</dd>
        </div>
        <div>
          <dt>Chunk</dt>
          <dd>{entityChunk}</dd>
        </div>
        <div>
          <dt>World</dt>
          <dd>{entityPosition}</dd>
        </div>
      </dl>
    </aside>
  );
}
