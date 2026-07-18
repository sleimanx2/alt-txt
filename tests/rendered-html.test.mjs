import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Alt-TXT assumption-correction instrument", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Alt-TXT — Better ways of working<\/title>/i);
  assert.match(html, /WE SELL/);
  assert.match(html, />AI</);
  assert.match(html, /Remove AI from this assumption/);
  assert.match(html, /The premise arrived too early\./);
  assert.match(html, /drag the wrong word out/);
  assert.match(html, /Bring us a hard thing/);
  assert.match(html, /Removed from the work/);
  assert.match(html, /Revision 1 of 6/);
  assert.match(
    html,
    /https:\/\/alt-txt-living-field\.sleiman757321\.chatgpt\.site\/og\.png/,
  );
  assert.match(html, /\/icon\.png/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Starter Project/);
});

test("preserves the progressive correction journey and accessibility contracts", async () => {
  const [page, layout, css, packageJson, lockfile] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../package-lock.json", import.meta.url), "utf8"),
  ]);

  await assert.rejects(access(new URL("app/_sites-preview", root)));
  assert.match(page, /const revisions = \[/);
  assert.equal((page.match(/kind: "/g) ?? []).length, 6);
  assert.match(page, /WE SELL BETTER WAYS OF WORKING\./);
  assert.match(page, /PROTECT HUMAN JUDGMENT\./);
  assert.match(page, /OWN THE OUTCOME\./);
  assert.match(page, /BRING US THE QUESTION\./);
  assert.match(page, /const artifacts = \{/);
  assert.match(page, /Krekib/);
  assert.match(page, /CeJour/);
  assert.match(page, /showModal\(\)/);
  assert.match(page, /onPointerDown=\{handleWordPointerDown\}/);
  assert.match(page, /onPointerCancel=\{cancelDrag\}/);
  assert.match(page, /aria-label=\{`Remove/);
  assert.match(page, /mailto:hello@alt-txt\.com/);
  assert.doesNotMatch(page, /setInterval/);
  assert.match(layout, /Alt-TXT — Better ways of working/);
  assert.match(layout, /summary_large_image/);
  assert.match(layout, /new URL\("\/og\.png", origin\)/);
  assert.match(css, /--acid: #c8f23a/);
  assert.match(css, /touch-action: none/);
  assert.match(css, /@media \(max-width: 700px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.doesNotMatch(lockfile, /react-loading-skeleton/);
  assert.doesNotMatch(page, /SkeletonPreview|codex-preview/);
});
