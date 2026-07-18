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

test("server-renders the Alt-TXT living field", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Alt-TXT — Better ways of working<\/title>/i);
  assert.match(html, /We don’t sell AI\./);
  assert.match(html, /We sell better ways of working\./);
  assert.match(html, /Knowledge current/);
  assert.match(html, /What is actually worth changing\?/);
  assert.match(html, /Krekib/);
  assert.match(html, /CeJour/);
  assert.match(html, /What if there’s a better way\?/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /aria-pressed="true"/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Starter Project/);
});

test("removes starter surfaces and preserves the interaction system", async () => {
  const [page, layout, css, packageJson, lockfile] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../package-lock.json", import.meta.url), "utf8"),
  ]);

  await assert.rejects(access(new URL("app/_sites-preview", root)));
  assert.match(page, /const stages = \[/);
  assert.match(page, /setInterval/);
  assert.match(page, /prefers-reduced-motion: reduce/);
  assert.match(page, /const artifacts = \{/);
  assert.match(layout, /Alt-TXT — Better ways of working/);
  assert.match(css, /--signal: #b7d51d/);
  assert.match(css, /@media \(max-width: 900px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.doesNotMatch(lockfile, /react-loading-skeleton/);
  assert.doesNotMatch(page, /SkeletonPreview|codex-preview/);
});
