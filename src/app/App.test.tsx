import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { App } from "./App";

vi.mock("./AppShell", () => ({
  AppShell: () => <div data-testid="app-shell">App shell</div>
}));

describe("App", () => {
  it("renders the app shell", () => {
    render(<App />);

    expect(screen.getByTestId("app-shell")).toBeInTheDocument();
  });
});
