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
        scene="settings"
      />
    );

    expect(screen.getByLabelText("Settings")).toBeInTheDocument();
    expect(screen.getByText(/Returning to runtime resumes the live loop/i)).toBeInTheDocument();
  });
});
