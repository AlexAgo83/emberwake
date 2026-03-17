type EntityInspectionPanelProps = {
  entityChunk: string;
  entityId: string;
  entityLabel: string;
  entityPosition: string;
  entitySelectionState: string;
  entityState: string;
  isMobile: boolean;
  onClose: () => void;
};

export function EntityInspectionPanel({
  entityChunk,
  entityId,
  entityLabel,
  entityPosition,
  entitySelectionState,
  entityState,
  isMobile,
  onClose
}: EntityInspectionPanelProps) {
  return (
    <aside
      className={`inspection-panel${isMobile ? " inspection-panel--mobile" : ""}`}
      aria-label="Inspecteur"
      data-testid="entity-inspection"
    >
      <header className="inspection-panel__header">
        <div>
          <p className="inspection-panel__eyebrow">Inspecteur</p>
          <h2>{entityLabel}</h2>
        </div>
        <button aria-label="Close inspecteur" className="panel-dismiss" onClick={onClose} type="button">
          Close
        </button>
      </header>
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
