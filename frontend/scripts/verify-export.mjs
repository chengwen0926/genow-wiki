import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import htmlParser from "next/dist/compiled/node-html-parser/index.js";
import { readWiki } from "../lib/content.mjs";

const output = fileURLToPath(new URL("../out/", import.meta.url));
const { pages } = await readWiki();
for (const [route, page] of [["/", pages[0]], ...pages.map((page) => [page.href, page])]) {
  const filename = path.join(output, decodeURIComponent(route), "index.html");
  const html = await readFile(filename, "utf8");
  const document = htmlParser.parse(html);
  const body = document.querySelector(".markdown-body");
  assert.ok(body, `${route}: missing article`);
  assert.equal(document.querySelector("h1").textContent, page.title);
  assert.equal(document.querySelector("html").getAttribute("lang"), "zh-CN");
  const ids = body.querySelectorAll("[id]").map((node) => node.id);
  assert.deepEqual(ids, page.headings.map((heading) => heading.id), `${route}: heading mismatch`);
  assert.equal(new Set(ids).size, ids.length, `${route}: duplicate heading`);
  assert.equal(document.querySelectorAll(".article-toc a").length, page.headings.filter((heading) => heading.level > 1).length);
  for (const link of document.querySelectorAll(".sidebar-tree a")) {
    assert.ok((await stat(path.join(output, decodeURIComponent(link.getAttribute("href")), "index.html"))).isFile());
  }
  for (const image of body.querySelectorAll("img")) {
    const src = image.getAttribute("src");
    if (!src.startsWith("/media/")) continue;
    assert.ok(Number(image.getAttribute("width")) > 0 && Number(image.getAttribute("height")) > 0);
    assert.ok((await stat(path.join(output, decodeURIComponent(src)))).isFile());
  }
  for (const video of body.querySelectorAll("video")) {
    assert.equal(video.getAttribute("src"), undefined, `${route}: eager video source`);
    assert.equal(video.getAttribute("autoplay"), undefined);
    assert.equal(video.getAttribute("preload"), "none");
    assert.ok(video.hasAttribute("controls"));
  }
  assert.ok(!html.includes("localhost:8002") && !html.includes("/api/wiki/"));
  console.log(`Verified ${route}: ${ids.length} headings, ${body.querySelectorAll("video").length} videos`);
}
assert.ok((await stat(path.join(output, "404.html"))).isFile());
const index = htmlParser.parse(await readFile(path.join(output, "index.html"), "utf8"));
const urls = new Set(index.querySelectorAll("script[src], link[href]")
  .map((node) => node.getAttribute("src") ?? node.getAttribute("href"))
  .filter((url) => url.startsWith("/_next/static/") && /\.(js|css)$/.test(url)));
let bytes = 0, gzip = 0;
for (const url of urls) {
  const data = await readFile(path.join(output, url));
  bytes += data.length;
  gzip += gzipSync(data).length;
}
console.log(`Homepage JS/CSS references (includes legacy polyfills): ${bytes} bytes; gzip ${gzip} bytes`);
