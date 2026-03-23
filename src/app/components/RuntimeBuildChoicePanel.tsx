import "./RuntimeBuildChoicePanel.css";

import type { BuildChoice } from "@game";

import { SkillIcon } from "./SkillIcon";

type RuntimeBuildChoicePanelProps = {
  choices: BuildChoice[];
  isMobile: boolean;
  onSelectChoice: (choiceIndex: number) => void;
};

const choiceTypeLabels: Record<BuildChoice["slotKind"], string> = {
  active: "Active",
  passive: "Passive"
};

const selectionKindLabels: Record<BuildChoice["selectionKind"], string> = {
  new: "New",
  upgrade: "Upgrade"
};

export function RuntimeBuildChoicePanel({
  choices,
  isMobile,
  onSelectChoice
}: RuntimeBuildChoicePanelProps) {
  if (choices.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Level up choices"
      className={`runtime-build-choice${isMobile ? " runtime-build-choice--mobile" : ""}`}
    >
      <div className="runtime-build-choice__header">
        <div>
          <p className="runtime-build-choice__eyebrow">Techno-shinobi build</p>
          <h2 className="runtime-build-choice__title">Choose the next discipline</h2>
          <p className="runtime-build-choice__detail">
            Time is suspended while the shell resolves the next combat rite.
          </p>
        </div>
        <p className="runtime-build-choice__status">Level up</p>
      </div>

      <div className="runtime-build-choice__grid">
        {choices.map((choice, choiceIndex) => (
          <button
            className="runtime-build-choice__card"
            key={choice.id}
            onClick={() => {
              onSelectChoice(choiceIndex);
            }}
            type="button"
          >
            <div className="runtime-build-choice__card-header">
              <div className="runtime-build-choice__identity">
                <SkillIcon
                  category={choice.slotKind}
                  id={choice.itemId}
                  label={choice.label}
                  size="md"
                />
                <div className="runtime-build-choice__identity-copy">
                  <span className="runtime-build-choice__tag">
                    {choiceTypeLabels[choice.slotKind]}
                  </span>
                  <strong className="runtime-build-choice__label">{choice.label}</strong>
                </div>
              </div>
              <span className="runtime-build-choice__tag runtime-build-choice__tag--state">
                {selectionKindLabels[choice.selectionKind]}
              </span>
            </div>
            <div className="runtime-build-choice__copy">
              <span className="runtime-build-choice__role">{choice.roleLine}</span>
              <span className="runtime-build-choice__level">
                Lv {choice.currentLevel} {"->"} {choice.nextLevel}
                {choice.maxLevel > 0 ? ` / ${choice.maxLevel}` : ""}
              </span>
              <span className="runtime-build-choice__effect">{choice.effectLine}</span>
              {choice.fusionPathReady ? (
                <span className="runtime-build-choice__fusion">Fusion path primed</span>
              ) : null}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
