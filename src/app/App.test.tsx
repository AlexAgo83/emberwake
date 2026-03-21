import { fireEvent, render, screen, within } from "@testing-library/react";
import { useEffect, useRef } from "react";
import { vi } from "vitest";

import { App } from "./App";

const mockSimulationState = {
  controls: {
    cycleWorldSeed: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    setSpeedMultiplier: vi.fn(),
    stepOnce: vi.fn(),
    togglePaused: vi.fn()
  },
  entity: {
    archetype: "generic-mover",
    footprint: {
      radius: 40
    },
    id: "entity:player:primary",
    isSelected: true,
    orientation: 0,
    renderLayer: 100,
    state: "idle",
    velocity: {
      x: 0,
      y: 0
    },
    visual: {
      kind: "ember-core",
      tint: "#ff7b3f"
    },
    worldPosition: {
      x: 0,
      y: 0
    }
  },
  presentation: {
    cameraTarget: {
      worldPosition: {
        x: 0,
        y: 0
      }
    },
    entities: [],
    world: {
      visibleChunks: []
    }
  },
  runtime: {
    accumulatorMs: 0,
    fixedStepMs: 1000 / 60,
    fps: 60,
    frameTimeMs: 16.67,
    isPaused: false,
    maxCatchUpStepsPerFrame: 6,
    simulationStepsLastFrame: 1,
    speedMultiplier: 1
  },
  tick: 0
};

Object.defineProperty(document, "fullscreenEnabled", {
  configurable: true,
  value: true
});

Object.defineProperty(HTMLElement.prototype, "requestFullscreen", {
  configurable: true,
  value: vi.fn().mockResolvedValue(undefined)
});

vi.mock("./components/RuntimeSceneBoundary", () => ({
  RuntimeSceneBoundary: ({ onRendererReady }: { onRendererReady?: () => void }) => {
    const readySignalSentRef = useRef(false);

    useEffect(() => {
      if (readySignalSentRef.current) {
        return;
      }

      readySignalSentRef.current = true;
      onRendererReady?.();
    }, [onRendererReady]);

    return <div data-testid="runtime-surface" />;
  }
}));

vi.mock("../game/entities/hooks/useEntitySimulation", () => ({
  useEntitySimulation: () => mockSimulationState
}));

describe("App", () => {
  it("renders a single floating menu trigger by default", async () => {
    render(<App />);

    expect(await screen.findByTestId("runtime-surface")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Menu" })).toBeInTheDocument();
    expect(screen.queryByText("Emberwake runtime")).not.toBeInTheDocument();
    expect(screen.queryByText("Movement-first loop")).not.toBeInTheDocument();
    expect(screen.queryByTestId("entity-inspection")).not.toBeInTheDocument();
  });

  it("opens menu-driven inspecteur and diagnostics surfaces on demand", async () => {
    render(<App />);

    await screen.findByTestId("runtime-surface");

    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    const shellMenu = screen.getByLabelText("Shell menu");

    expect(within(shellMenu).getByRole("button", { name: /Inspecteur/i })).toBeInTheDocument();
    expect(within(shellMenu).getByRole("button", { name: /Diagnostics/i })).toBeInTheDocument();
    expect(within(shellMenu).getByRole("button", { name: "Free" })).toBeInTheDocument();
    expect(within(shellMenu).getByRole("button", { name: "Follow entity" })).toBeInTheDocument();

    fireEvent.click(within(shellMenu).getByRole("button", { name: /Inspecteur/i }));

    expect(screen.getByTestId("entity-inspection")).toBeInTheDocument();
    expect(screen.queryByLabelText("Shell diagnostics")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    fireEvent.click(
      within(screen.getByLabelText("Shell menu")).getByRole("button", { name: /Diagnostics/i })
    );

    expect(screen.getByLabelText("Shell diagnostics")).toBeInTheDocument();
  });

  it("supports pause and runtime re-entry through the shell meta flow", async () => {
    render(<App />);

    await screen.findByTestId("runtime-surface");

    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    fireEvent.click(
      within(screen.getByLabelText("Shell menu")).getByRole("button", { name: /Pause runtime/i })
    );

    expect(screen.getByLabelText("Runtime paused")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Resume runtime/i }));

    expect(screen.queryByLabelText("Runtime paused")).not.toBeInTheDocument();
  });
});
