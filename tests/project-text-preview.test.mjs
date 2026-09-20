import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));
const vite = await createServer({
  appType: "custom", configFile: false, root,
  resolve: { alias: { "@": root } },
  server: { middlewareMode: true },
});
after(() => vite.close());
const { projects } = await vite.ssrLoadModule("/data/projects.ts");
const { posterProjects } = await vite.ssrLoadModule("/components/LongPoster.tsx");
const { ProjectTextPreview } = await vite.ssrLoadModule("/components/ProjectTextPreview.tsx");
const { isCardTextRegion } = await vite.ssrLoadModule("/components/cardTextRegion.ts");
const noop = () => {};
const escape = (text) => renderToStaticMarkup(React.createElement(React.Fragment, null, text));

test("every selectable project has all reading fields and its own rendered preview", () => {
  assert.equal(posterProjects.length, 6);
  assert.equal(new Set(projects.map((project) => project.id)).size, projects.length);
  for (const poster of posterProjects) {
    const details = projects.find((project) => project.id === poster.id);
    assert.ok(details, poster.id);
    const project = { ...poster, ...details, title: poster.title, copy: details.copy.join(" ") };
    const fields = [project.title, project.chinese, project.copy, project.role, ...project.workflow, ...project.tools];
    assert.ok(project.workflow.length && project.tools.length);
    assert.ok(fields.every((field) => typeof field === "string" && field.trim()));
    const html = renderToStaticMarkup(React.createElement(ProjectTextPreview, {
      project, open: true, onKeepOpen: noop, onLeave: noop, onClose: noop,
    }));
    for (const text of fields) assert.ok(html.includes(escape(text)), `${poster.id}: ${text}`);
    assert.match(html, /data-open="true"/);
    assert.doesNotMatch(html, /\sinert=/);
  }
});

test("closed panels are inert and hidden from assistive technology", () => {
  const project = { ...projects[0], copy: projects[0].copy.join(" ") };
  const html = renderToStaticMarkup(React.createElement(ProjectTextPreview, {
    project, open: false, onKeepOpen: noop, onLeave: noop, onClose: noop,
  }));
  assert.match(html, /aria-hidden="true"/);
  assert.match(html, /\sinert=""/);
});

test("all existing front and back card text falls inside the shared UV text regions", async () => {
  for (const project of projects) {
    for (const face of ["front", "back"]) {
      const svg = await readFile(new URL(`../public/assets/lanyard/cards/${project.id}-${face}.svg`, import.meta.url), "utf8");
      const textNodes = [...svg.matchAll(/<text\b([^>]+)>/g)];
      assert.ok(textNodes.length);
      for (const [, attrs] of textNodes) {
        const x = Number(attrs.match(/\bx="([^"]+)"/)[1]);
        const y = Number(attrs.match(/\by="([^"]+)"/)[1]);
        assert.ok(isCardTextRegion(face, { x: x / 1200, y: 1 - y / 1680 }), `${project.id} ${face}: ${x},${y}`);
      }
    }
  }
  assert.equal(isCardTextRegion("front", { x: 0.5, y: 0.8 }), false, "artwork does not open text preview");
  assert.equal(isCardTextRegion("front", { x: 0.5, y: 0.3 }), true);
  assert.equal(isCardTextRegion("back", { x: 0.5, y: 0.8 }), true);
  assert.equal(isCardTextRegion("back", { x: 0.01, y: 0.5 }), false, "card edge is not text");
  assert.equal(isCardTextRegion("front"), false);
});
