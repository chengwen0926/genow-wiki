import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import htmlParser from "next/dist/compiled/node-html-parser/index.js";
import { readWiki } from "../lib/content.mjs";

const output = fileURLToPath(new URL("../out/", import.meta.url));
const { pages } = await readWiki();
const cache = new Map();
async function readRoute(route) {
  if (!cache.has(route)) cache.set(route, htmlParser.parse(await readFile(path.join(output, decodeURIComponent(route), "index.html"), "utf8")));
  return cache.get(route);
}
for (const [route, page] of [["/", null], ...pages.map((page) => [page.href, page])]) {
  const document = await readRoute(route);
  assert.equal(document.querySelector("html").getAttribute("lang"), "zh-CN");
  assert.ok(document.querySelector("#main-content"), `${route}: skip link target`);
  const body = document.querySelector(".markdown-body");
  if (page) {
    assert.ok(body, `${route}: missing article`);
    assert.equal(document.querySelector("h1").textContent, page.title);
    const ids = body.querySelectorAll("[id]").map((node) => node.id);
    assert.deepEqual(ids, page.headings.map((heading) => heading.id), `${route}: heading mismatch`);
    assert.equal(new Set(ids).size, ids.length, `${route}: duplicate heading`);
    assert.equal(document.querySelectorAll(".article-toc a").length, page.headings.filter((h) => h.level > 1).length);
    assert.equal(!!document.querySelector("[data-pagefind-body]"), !page.hidden);
    assert.ok(!body.textContent.includes("sourceChapter:"), "frontmatter must not appear in body");
    assert.ok(!/\*\*[^*]+：\*\*/.test(body.textContent), `${route}: unrendered bold labels`);
    assert.ok(!/第\s*\d+\s*章/.test(body.textContent), `${route}: obsolete chapter reference`);
    const mobileToc = document.querySelector(".mobile-toc");
    if (mobileToc) assert.ok(mobileToc.hasAttribute("data-pagefind-ignore"), "search must exclude mobile navigation");
  } else {
    assert.equal(document.querySelector("h1").textContent, "让创作，从这里开始。");
    assert.equal(document.querySelectorAll(".feature-card").length, 4);
    assert.ok(!document.querySelector("[data-pagefind-body]"), "homepage should not duplicate search results");
  }
  // Check every internal link, including cross-page anchors and previous/next navigation.
  for (const link of document.querySelectorAll("a[href]")) {
    const href = link.getAttribute("href");
    if (!href.startsWith("/") && !href.startsWith("#")) continue;
    const url = new URL(href, `https://docs.invalid${route}`);
    if (url.pathname.startsWith("/media/")) {
      assert.ok((await stat(path.join(output, decodeURIComponent(url.pathname)))).isFile()); continue;
    }
    const target = await readRoute(url.pathname);
    if (url.hash) assert.ok(target.querySelectorAll("[id]").some((n) => n.id === decodeURIComponent(url.hash.slice(1))), `${route}: broken anchor ${href}`);
  }
  for (const image of body?.querySelectorAll("img") ?? []) {
    const src = image.getAttribute("src");
    if (!src.startsWith("/media/")) continue;
    assert.ok(Number(image.getAttribute("width")) > 0 && Number(image.getAttribute("height")) > 0);
    assert.ok((await stat(path.join(output, decodeURIComponent(src)))).isFile());
  }
  for (const video of body?.querySelectorAll("video") ?? []) {
    assert.equal(video.getAttribute("src"), undefined, `${route}: eager video source`);
    assert.equal(video.getAttribute("autoplay"), undefined);
    assert.equal(video.getAttribute("preload"), "none");
    assert.ok(video.hasAttribute("controls"));
  }
  assert.ok(!document.toString().includes("localhost:8002") && !document.toString().includes("/api/wiki/"));
  console.log(`Verified ${route}: links, anchors, navigation and search scope`);
}
assert.ok((await stat(path.join(output, "404.html"))).isFile());
assert.ok((await stat(path.join(output, "pagefind/pagefind.js"))).isFile());
const searchEntry = JSON.parse(await readFile(path.join(output, "pagefind/pagefind-entry.json"), "utf8"));
assert.equal(searchEntry.languages["zh-cn"].page_count, pages.filter((p) => !p.hidden).length, "index must contain all current articles only");
const index = await readRoute("/");
const urls = new Set(index.querySelectorAll("script[src], link[href]")
  .map((node) => node.getAttribute("src") ?? node.getAttribute("href"))
  .filter((url) => url.startsWith("/_next/static/") && /\.(js|css)$/.test(url)));
let bytes = 0, gzip = 0;
for (const url of urls) { const data = await readFile(path.join(output, url)); bytes += data.length; gzip += gzipSync(data).length; }
console.log(`Homepage JS/CSS references (includes legacy polyfills): ${bytes} bytes; gzip ${gzip} bytes`);
