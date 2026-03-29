import "./RuntimeBuildChoicePanel.css";

import { useMemo } from "react";

import type { BuildChoice } from "@game";

import { SkillIcon } from "./SkillIcon";

type RuntimeBuildChoicePanelProps = {
  choices: BuildChoice[];
  isMobile: boolean;
  onPass: () => void;
  onReroll: () => void;
  onSelectChoice: (choiceIndex: number) => void;
  passCount: number;
  rerollCount: number;
};

const trackLabels: Record<BuildChoice["track"], string> = {
  combat: "Skills / Fusions",
  passive: "Passives"
};

const selectionKindLabels: Record<BuildChoice["selectionKind"], string> = {
  fusion: "Fusion",
  new: "New",
  upgrade: "Upgrade"
};

const trackAccentClass: Record<BuildChoice["track"], string> = {
  combat: "runtime-build-choice__track--combat",
  passive: "runtime-build-choice__track--passive"
};

export function RuntimeBuildChoicePanel({
  choices,
  isMobile,
  onPass,
  onReroll,
  onSelectChoice,
  passCount,
  rerollCount
}: RuntimeBuildChoicePanelProps) {
  const groupedChoices = useMemo(
    () => ({
      combat: choices
        .map((choice, choiceIndex) => ({ choice, choiceIndex }))
        .filter(({ choice }) => choice.track === "combat"),
      passive: choices
        .map((choice, choiceIndex) => ({ choice, choiceIndex }))
        .filter(({ choice }) => choice.track === "passive")
    }),
    [choices]
  );

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
            One pick total. Reroll refreshes both tracks. Pass skips this gain moment.
          </p>
        </div>

        <div className="runtime-build-choice__controls">
          <button
            className="runtime-build-choice__action"
            disabled={rerollCount <= 0}
            onClick={onReroll}
            type="button"
          >
            Reroll
            <span>{rerollCount}</span>
          </button>
          <button
            className="runtime-build-choice__action runtime-build-choice__action--muted"
            disabled={passCount <= 0}
            onClick={onPass}
            type="button"
          >
            Pass
            <span>{passCount}</span>
          </button>
        </div>
      </div>

      <div className="runtime-build-choice__tracks">
        {(["combat", "passive"] as const).map((track) => (
          <section
            className={`runtime-build-choice__track ${trackAccentClass[track]}`}
            key={track}
          >
            <div className="runtime-build-choice__track-header">
              <p className="runtime-build-choice__status">{trackLabels[track]}</p>
            </div>

            <div className="runtime-build-choice__grid">
              {groupedChoices[track].map(({ choice, choiceIndex }) => (
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
                        category={choice.displayCategory}
                        id={choice.iconId}
                        label={choice.label}
                        size="md"
                      />
                      <div className="runtime-build-choice__identity-copy">
                        <span className="runtime-build-choice__tag">
                          {selectionKindLabels[choice.selectionKind]}
                        </span>
                        <strong className="runtime-build-choice__label">{choice.label}</strong>
                      </div>
                    </div>
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
        ))}
      </div>
    </section>
  );
}
