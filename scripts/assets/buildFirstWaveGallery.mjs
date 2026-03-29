/* global console */

import { writeFileSync } from "node:fs";
import {
  escapeHtml,
  firstWaveAssetPlan,
  galleryFilePath,
  listCandidateFiles,
  loadSelectionMap,
  toRelativeFromRepo
} from "./firstWaveAssetWorkflow.mjs";

const selectionMap = loadSelectionMap();
const candidateFiles = new Set(listCandidateFiles().map((path) => toRelativeFromRepo(path)));

const cards = firstWaveAssetPlan
  .map((entry) => {
    const selectedPath = selectionMap[entry.assetId] ?? "";
    const candidatePath = `output/imagegen/first-wave/${selectedPath}`;
    const imageMarkup = candidateFiles.has(candidatePath)
      ? `<img src="${escapeHtml(selectedPath)}" alt="${escapeHtml(entry.assetId)}" />`
      : `<div class="placeholder">No candidate yet</div>`;

    return `
      <article class="card">
        <header>
          <strong>${escapeHtml(entry.assetId)}</strong>
          <span>${escapeHtml(entry.deliveryFormat)}</span>
        </header>
        <div class="thumb">${imageMarkup}</div>
        <p>${escapeHtml(entry.prompt)}</p>
      </article>
    `;
  })
  .join("\n");

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>First-wave asset review</title>
    <style>
      body { font-family: system-ui, sans-serif; background: #10131a; color: #eef3ff; margin: 0; padding: 24px; }
      h1 { margin-top: 0; }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px; }
      .card { background: #171d28; border: 1px solid #263244; border-radius: 16px; padding: 14px; }
      .card header { display: flex; justify-content: space-between; gap: 8px; font-size: 12px; color: #92a5c7; margin-bottom: 10px; }
      .thumb { min-height: 220px; display: flex; align-items: center; justify-content: center; background:
        linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
        border-radius: 12px; overflow: hidden; margin-bottom: 10px; }
      img { max-width: 100%; max-height: 240px; display: block; }
      .placeholder { color: #6c7e9f; font-size: 14px; }
      p { font-size: 12px; line-height: 1.45; color: #c7d3e8; }
    </style>
  </head>
  <body>
    <h1>First-wave generated asset review</h1>
    <div class="grid">${cards}</div>
  </body>
</html>`;

writeFileSync(galleryFilePath, html, "utf8");
console.log(`Wrote ${galleryFilePath}`);
