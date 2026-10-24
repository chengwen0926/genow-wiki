import test from "node:test";
import { visit } from "unist-util-visit";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm, readdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { parseMarkdown, pageHref } from "../lib/markdown.mjs";
import { readWiki, localMediaPath } from "../lib/content.mjs";
import { syncMedia } from "../scripts/sync-media.mjs";

test("headings share unique IDs, skip code fences and flatten formatting", () => {
  const { headings } = parseMarkdown("# 标题\n## **Kling** `参数`\n## Kling 参数\n## Kling 参数-1\n```md\n# ignored\n```\n## !!!");
  assert.deepEqual(headings.map((h) => h.id), ["标题", "kling-参数", "kling-参数-1", "kling-参数-1-1", "section"]);
});

test("all existing articles and media resolve in the expected order", async () => {
  const { pages } = await readWiki();
  assert.equal(pages.filter((p) => !p.hidden).length, 19);
  assert.equal(pages[0].slug, "start/overview");
  assert.ok(pages.find((p) => p.slug === "create/images").headings.length > 7);
  assert.ok(pages.filter((p) => p.hidden).every((p) => p.markdown.includes("查看最新使用说明")));
  for (const page of pages) visit(parseMarkdown(page.markdown).tree, "text", (node) => {
    assert.ok(!node.value.includes("**"), `${page.slug}: unrendered emphasis`);
  });
  for (const page of pages) for (const image of Object.values(page.images)) {
    assert.ok(image.width > 0 && image.height > 0);
  }
});

test("nested Chinese slugs and missing media", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "wiki-content-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "指南"));
  await writeFile(path.join(root, "指南", "入门.md"), "# 入门\n\n正文");
  const { tree, pages } = await readWiki(root);
  assert.equal(tree[0].children[0].slug, "指南/入门");
  assert.equal(pages[0].href, pageHref("指南/入门"));
  assert.equal(pages[0].href, "/wiki/%E6%8C%87%E5%8D%97/%E5%85%A5%E9%97%A8/");
  await writeFile(path.join(root, "指南", "入门.md"), "![missing](/media/nonexistent.png)");
  await assert.rejects(readWiki(root), /cannot read media/);
  assert.throws(() => localMediaPath("/media/%2e%2e/private.txt"), /Invalid media path/);
});

test("media synchronization removes stale files without touching siblings", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "wiki-media-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const source = path.join(root, "source"), output = path.join(root, "output");
  await mkdir(source);
  await mkdir(output);
  await writeFile(path.join(source, "视频.mp4"), "test");
  await writeFile(path.join(output, "stale.mp4"), "old");
  await syncMedia(source, output);
  assert.deepEqual(await readdir(output), ["视频.mp4"]);
  assert.deepEqual((await readdir(root)).sort(), ["output", "source"]);
});

test("metadata controls grouping and order; hidden compatibility pages stay out of navigation", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "wiki-meta-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(path.join(root, "navigation.json"), JSON.stringify([{ id: "guide", title: "指南" }]));
  await writeFile(path.join(root, "a.md"), "---\ntitle: 后一篇\ngroup: guide\norder: 2\n---\n# 标题\n正文");
  await writeFile(path.join(root, "b.md"), "---\ntitle: 入门\ngroup: guide\norder: 1\nkeywords: 参考图\n---\n# 入门");
  await writeFile(path.join(root, "old.md"), "---\nhidden: true\n---\n# 旧入口");
  const { tree, pages } = await readWiki(root);
  assert.deepEqual(tree[0].children.map((p) => p.title), ["入门", "后一篇"]);
  assert.deepEqual(pages.map((p) => p.slug), ["b", "a", "old"]);
  assert.ok(!pages[0].markdown.includes("keywords:"));
  await writeFile(path.join(root, "bad.md"), "---\ngroup: typo\n---\n# Bad");
  await assert.rejects(readWiki(root), /unknown navigation group/);
  await writeFile(path.join(root, "bad.md"), "---\norder: first\ngroup: guide\n---\n# Bad");
  await assert.rejects(readWiki(root), /order must be a number/);
});
