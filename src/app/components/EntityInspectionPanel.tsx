type EntityInspectionPanelProps = {
  entityChunk: string;
  entityId: string;
  entityLabel: string;
  entityPosition: string;
  entitySelectionState: string;
  entityState: string;
  isMobile: boolean;
};

export function EntityInspectionPanel({
  entityChunk,
  entityId,
  entityLabel,
  entityPosition,
  entitySelectionState,
  entityState,
  isMobile
}: EntityInspectionPanelProps) {
  return (
    <aside
      className={`inspection-panel${isMobile ? " inspection-panel--mobile" : ""}`}
      aria-label="Selected entity inspection"
      data-testid="entity-inspection"
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
          <dd data-testid="entity-state">{entityState}</dd>
        </div>
        <div>
          <dt>Selection</dt>
          <dd>{entitySelectionState}</dd>
        </div>
        <div>
          <dt>Chunk</dt>
          <dd>{entityChunk}</dd>
        </div>
        <div>
          <dt>World</dt>
          <dd data-testid="entity-world">{entityPosition}</dd>
        </div>
      </dl>
    </aside>
  );
}
