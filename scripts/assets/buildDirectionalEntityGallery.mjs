/* global console */

import { writeFileSync } from "node:fs";

import {
  directionalEntityPlan,
  directionalGalleryFilePath,
  escapeHtml,
  listCandidateFiles,
  loadSelectionMap,
  toRelativeFromRepo
} from "./directionalEntityWorkflow.mjs";

const selectionMap = loadSelectionMap();
const candidateFiles = new Set(listCandidateFiles().map((path) => toRelativeFromRepo(path)));

const cards = directionalEntityPlan
  .map((entry) => {
    const facingCards = entry.generatedFacings
      .map((facing) => {
        const selectedPath = selectionMap[`${entry.assetId}.${facing}`] ?? "";
        const candidatePath = `output/imagegen/directional-entities/${selectedPath}`;
        const imageMarkup = candidateFiles.has(candidatePath)
          ? `<img src="${escapeHtml(selectedPath)}" alt="${escapeHtml(`${entry.assetId}.${facing}`)}" />`
          : `<div class="placeholder">No candidate yet</div>`;

        return `
          <article class="facing-card">
            <header>
              <strong>${escapeHtml(facing)}</strong>
            </header>
            <div class="thumb">${imageMarkup}</div>
            <p>${escapeHtml(entry.prompts[facing])}</p>
          </article>
        `;
      })
      .join("\n");

    return `
      <section class="family">
        <h2>${escapeHtml(entry.familyLabel)}</h2>
        <p class="asset-id">${escapeHtml(entry.assetId)}</p>
        <div class="facing-grid">${facingCards}</div>
      </section>
    `;
  })
  .join("\n");

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Directional entity asset review</title>
    <style>
      body { font-family: system-ui, sans-serif; background: #10131a; color: #eef3ff; margin: 0; padding: 24px; }
      h1, h2, p { margin-top: 0; }
      .family { display: grid; gap: 14px; margin-bottom: 28px; }
      .asset-id { color: #92a5c7; font-size: 13px; margin-bottom: 0; }
      .facing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 18px; }
      .facing-card { background: #171d28; border: 1px solid #263244; border-radius: 16px; padding: 14px; }
      .facing-card header { display: flex; justify-content: space-between; gap: 8px; font-size: 12px; color: #92a5c7; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.08em; }
      .thumb { min-height: 220px; display: flex; align-items: center; justify-content: center; background:
        linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
        border-radius: 12px; overflow: hidden; margin-bottom: 10px; }
      img { max-width: 100%; max-height: 240px; display: block; }
      .placeholder { color: #6c7e9f; font-size: 14px; }
      p { font-size: 12px; line-height: 1.45; color: #c7d3e8; }
    </style>
  </head>
  <body>
    <h1>Directional entity generated asset review</h1>
    ${cards}
  </body>
</html>`;

writeFileSync(directionalGalleryFilePath, html, "utf8");
console.log(`Wrote ${directionalGalleryFilePath}`);
