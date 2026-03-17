import { mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import process from "node:process";
import { setTimeout as sleep } from "node:timers/promises";
import { URL } from "node:url";

import { chromium } from "playwright";

const previewHost = "127.0.0.1";
const outputDirectory = new URL("../../output/playwright/", import.meta.url);

const waitForPreview = async () => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < 15000) {
    try {
      const response = await globalThis.fetch(previewUrl);

      if (response.ok) {
        return;
      }
    } catch {
      await sleep(250);
      continue;
    }

    await sleep(250);
  }

  throw new Error(`Preview server did not start within 15s: ${previewUrl}`);
};

const resolveFreePort = () =>
  new Promise((resolve, reject) => {
    const server = createServer();

    server.unref();
    server.on("error", reject);
    server.listen(0, previewHost, () => {
      const address = server.address();

      if (!address || typeof address === "string") {
        server.close(() => {
          reject(new Error("Could not resolve a free preview port for browser smoke."));
        });
        return;
      }

      const { port } = address;

      server.close((closeError) => {
        if (closeError) {
          reject(closeError);
          return;
        }

        resolve(port);
      });
    });
  });

const parseWorldPosition = (value) => {
  const [x, y] = value.split(",").map((part) => Number(part.trim()));

  if (Number.isNaN(x) || Number.isNaN(y)) {
    throw new Error(`Could not parse world position from: ${value}`);
  }

  return { x, y };
};

const previewPort = await resolveFreePort();
const previewUrl = `http://${previewHost}:${previewPort}`;

const previewServer = spawn(
  "npm",
  ["run", "preview", "--", "--host", previewHost, "--port", String(previewPort), "--strictPort"],
  {
    cwd: new URL("../../", import.meta.url),
    env: {
      ...process.env,
      CI: "1",
      VITE_APP_ENV: process.env.VITE_APP_ENV ?? "preview"
    },
    stdio: "inherit"
  }
);

let browser;

try {
  await waitForPreview();
  await mkdir(outputDirectory, {
    recursive: true
  });

  browser = await chromium.launch({
    headless: true
  });

  const page = await browser.newPage({
    viewport: {
      width: 1280,
      height: 800
    }
  });

  await page.goto(previewUrl, {
    waitUntil: "networkidle"
  });

  await page.getByLabel("Interactive runtime shell").click({
    position: {
      x: 120,
      y: 120
    }
  });

  const inspectionPanel = page.getByTestId("entity-inspection");
  const playerHud = page.getByTestId("player-hud");
  const worldPosition = inspectionPanel.getByTestId("entity-world");
  const hudHint = playerHud.getByTestId("player-hud-hint");

  const initialPosition = parseWorldPosition((await worldPosition.textContent()) ?? "");

  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(400);
  await page.keyboard.up("ArrowRight");
  await page.waitForTimeout(150);

  const nextPosition = parseWorldPosition((await worldPosition.textContent()) ?? "");
  const resolvedHint = ((await hudHint.textContent()) ?? "").trim();

  if (nextPosition.x <= initialPosition.x) {
    throw new Error(
      `Expected entity to move to the right. Initial: ${initialPosition.x}, next: ${nextPosition.x}`
    );
  }

  if (!resolvedHint.includes("Movement acknowledged")) {
    throw new Error(`Expected onboarding hint to resolve after movement. Received: ${resolvedHint}`);
  }

  await page.screenshot({
    path: new URL("browser-smoke.png", outputDirectory).pathname
  });
} finally {
  await browser?.close();

  if (!previewServer.killed) {
    previewServer.kill("SIGTERM");
  }
}
