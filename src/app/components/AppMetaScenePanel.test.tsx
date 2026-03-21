import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { AppMetaScenePanel } from "./AppMetaScenePanel";

describe("AppMetaScenePanel", () => {
  it("stays hidden outside shell-owned meta scenes", () => {
    const onResumeRuntime = vi.fn();

    const { container } = render(
      <AppMetaScenePanel
        fullscreenPreferred={false}
        onResumeRuntime={onResumeRuntime}
        scene="runtime"
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders pause metadata and resumes the runtime on demand", () => {
    const onResumeRuntime = vi.fn();

    render(
      <AppMetaScenePanel
        fullscreenPreferred={true}
        onResumeRuntime={onResumeRuntime}
        runtimeOutcome={null}
        scene="pause"
      />
    );

    expect(screen.getByLabelText("Runtime paused")).toBeInTheDocument();
    expect(screen.getByText("remembered")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Resume runtime/i }));

    expect(onResumeRuntime).toHaveBeenCalledTimes(1);
  });

  it("renders settings details while keeping runtime re-entry available", () => {
    render(
      <AppMetaScenePanel
        fullscreenPreferred={false}
        onResumeRuntime={vi.fn()}
        runtimeOutcome={null}
        scene="settings"
      />
    );

    expect(screen.getByLabelText("Settings")).toBeInTheDocument();
    expect(screen.getByText(/Returning to runtime resumes the live loop/i)).toBeInTheDocument();
  });

  it("renders gameplay outcomes through shell-owned meta scenes", () => {
    render(
      <AppMetaScenePanel
        fullscreenPreferred={false}
        onResumeRuntime={vi.fn()}
        runtimeOutcome={{
          detail: "Traversal goal reached without shell-owned defeat handling leaking into gameplay internals.",
          emittedAtTick: 42,
          kind: "victory",
          shellScene: "victory"
        }}
        scene="victory"
      />
    );

    expect(screen.getByLabelText("Victory")).toBeInTheDocument();
    expect(screen.getByText(/Traversal goal reached/i)).toBeInTheDocument();
    expect(screen.getByText(/gameplay outcome victory/i)).toBeInTheDocument();
  });
});
