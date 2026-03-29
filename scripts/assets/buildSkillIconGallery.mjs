/* global console */

import { writeFileSync } from "node:fs";

import {
  escapeHtml,
  listCandidateFiles,
  loadSelectionMap,
  skillIconGalleryFilePath,
  skillIconPlan,
  toRelativeFromRepo
} from "./skillIconWorkflow.mjs";

const selectionMap = loadSelectionMap();
const candidateFiles = new Set(listCandidateFiles().map((path) => toRelativeFromRepo(path)));

const cards = skillIconPlan
  .map((entry) => {
    const selectedPath = selectionMap[entry.assetId] ?? "";
    const candidatePath = `output/imagegen/skill-icons/${selectedPath}`;
    const imageMarkup = candidateFiles.has(candidatePath)
      ? `<img src="${escapeHtml(selectedPath)}" alt="${escapeHtml(entry.label)}" />`
      : `<div class="placeholder">No candidate yet</div>`;

    return `
      <article class="icon-card">
        <header>
          <strong>${escapeHtml(entry.label)}</strong>
          <span>${escapeHtml(entry.category)}</span>
        </header>
        <div class="thumb">${imageMarkup}</div>
        <p class="asset-id">${escapeHtml(entry.assetId)}</p>
        <p>${escapeHtml(entry.prompt)}</p>
      </article>
    `;
  })
  .join("\n");

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Skill icon review</title>
    <style>
      body { font-family: system-ui, sans-serif; background: #10131a; color: #eef3ff; margin: 0; padding: 24px; }
      h1, p { margin-top: 0; }
      .icon-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 18px; }
      .icon-card { background: #171d28; border: 1px solid #263244; border-radius: 16px; padding: 14px; }
      .icon-card header { display: flex; justify-content: space-between; gap: 8px; font-size: 12px; color: #92a5c7; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.08em; }
      .thumb { min-height: 180px; display: flex; align-items: center; justify-content: center; background:
        linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
        border-radius: 12px; overflow: hidden; margin-bottom: 10px; }
      img { max-width: 100%; max-height: 180px; display: block; }
      .asset-id { color: #92a5c7; font-size: 13px; margin-bottom: 8px; }
      .placeholder { color: #6c7e9f; font-size: 14px; }
      p { font-size: 12px; line-height: 1.45; color: #c7d3e8; }
    </style>
  </head>
  <body>
    <h1>Skill icon review</h1>
    <div class="icon-grid">${cards}</div>
  </body>
</html>`;

writeFileSync(skillIconGalleryFilePath, html, "utf8");
console.log(`Wrote ${skillIconGalleryFilePath}`);
