import { readFile, readdir, stat, realpath } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import sharp from "sharp";
import matter from "gray-matter";
import { visit } from "unist-util-visit";
import { toString } from "mdast-util-to-string";
import { parseMarkdown, pageHref } from "./markdown.mjs";

export const projectRoot = path.resolve(process.cwd(), "..");
export const contentRoot = path.join(projectRoot, "content");
export const assetsRoot = path.join(projectRoot, "assets");
const order = ["console-mode", "canvas-mode", "history", "sketch-mode", "other"];
const titles = { other: "其他" };

function nameTitle(name) {
  return titles[name] ?? name.replace(/[-_]/g, " ");
}

export function localMediaPath(url, root = assetsRoot) {
  if (!url.startsWith("/media/")) return null;
  const relative = decodeURIComponent(url.split(/[?#]/, 1)[0].slice(7));
  const resolved = path.resolve(root, relative);
  if (!resolved.startsWith(`${path.resolve(root)}${path.sep}`)) {
    throw new Error(`Invalid media path: ${url}`);
  }
  return resolved;
}

function gitUpdatedAt(file) {
  try {
    const value = execFileSync("git", ["log", "-1", "--format=%cI", "--", file], {
      cwd: projectRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return value && !Number.isNaN(Date.parse(value)) ? value : null;
  } catch {
    return null;
  }
}

export async function readWiki(root = contentRoot, mediaRoot = assetsRoot) {
  const pages = [];
  let groups = [];
  try { groups = JSON.parse(await readFile(path.join(root, "navigation.json"), "utf8")); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
  if (!Array.isArray(groups) || groups.some((g) => !g.id || !g.title) || new Set(groups.map((g) => g.id)).size !== groups.length) {
    throw new Error("Invalid content/navigation.json");
  }
  async function walk(directory) {
    const entries = (await readdir(directory, { withFileTypes: true }))
      .filter((entry) => !entry.name.startsWith(".") && (entry.isDirectory() || (entry.isFile() && /\.md$/i.test(entry.name))))
      .sort((a, b) => {
        if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1;
        const rank = (entry) => {
          const index = order.indexOf(entry.name.replace(/\.md$/i, ""));
          return index < 0 ? 999 : index;
        };
        return rank(a) - rank(b) || a.name.localeCompare(b.name, "en");
      });
    const nodes = [];
    for (const entry of entries) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        const children = await walk(file);
        if (children.length) nodes.push({ type: "directory", name: entry.name, title: nameTitle(entry.name), slug: null, children });
        continue;
      }
      const slug = path.relative(root, file).replace(/\.md$/i, "").split(path.sep).join("/");
      const { content: markdown, data } = matter(await readFile(file, "utf8"));
      for (const key of ["title", "description", "group", "keywords"]) {
        if (data[key] !== undefined && typeof data[key] !== "string") throw new Error(`${slug}: ${key} must be a string`);
      }
      if (data.order !== undefined && !Number.isFinite(data.order)) throw new Error(`${slug}: order must be a number`);
      if (data.hidden !== undefined && typeof data.hidden !== "boolean") throw new Error(`${slug}: hidden must be a boolean`);
      if (groups.length && !data.hidden && !data.group) throw new Error(`${slug}: group is required`);
      if (data.group && !groups.some((g) => g.id === data.group)) throw new Error(`${slug}: unknown navigation group ${data.group}`);
      const { tree, headings } = parseMarkdown(markdown);
      const title = data.title ?? headings.find((heading) => heading.level === 1)?.text ?? nameTitle(path.parse(entry.name).name);
      const paragraph = tree.children.find((node) => node.type === "paragraph");
      const images = {};
      const resources = [];
      visit(tree, (node) => {
        if (["image", "link", "definition"].includes(node.type)) resources.push(node);
      });
      for (const resource of resources) {
        const media = localMediaPath(resource.url, mediaRoot);
        if (!media) continue;
        try {
          if (!(await realpath(media)).startsWith(`${await realpath(mediaRoot)}${path.sep}`)) throw new Error("media outside assets directory");
          if (!(await stat(media)).isFile()) throw new Error("not a file");
          if (resource.type === "image" || /\.(png|jpe?g|webp|gif|avif)$/i.test(media)) {
            const metadata = await sharp(media).metadata();
            images[resource.url] = { width: metadata.width, height: metadata.height };
          }
        } catch (error) {
          throw new Error(`${slug}: cannot read media ${resource.url}`, { cause: error });
        }
      }
      pages.push({ slug, href: pageHref(slug), title, markdown, headings, images,
        description: data.description ?? (paragraph ? toString(paragraph).slice(0, 160) : `${title} - Genow Wiki`),
        group: data.group ?? "", groupTitle: groups.find((g) => g.id === data.group)?.title ?? "使用文档",
        order: data.order ?? 999, keywords: data.keywords ?? "", hidden: data.hidden ?? false,
        updatedAt: gitUpdatedAt(file) });
      nodes.push({ type: "page", name: path.parse(entry.name).name, title, slug, children: [] });
    }
    return nodes;
  }
  const tree = await walk(root);
  if (!pages.length) throw new Error("No Markdown pages found in content/");
  if (!groups.length) return { tree, pages };
  const rank = (page) => page.hidden ? 999 : groups.findIndex((g) => g.id === page.group);
  pages.sort((a, b) => rank(a) - rank(b) || a.order - b.order || a.slug.localeCompare(b.slug));
  const node = (page) => ({ type: "page", name: page.slug, title: page.title, slug: page.slug, children: [] });
  const groupedTree = groups.map((group) => ({ type: "directory", name: group.id, title: group.title, slug: null,
    children: pages.filter((p) => p.group === group.id && !p.hidden).map(node) })).filter((g) => g.children.length);
  groupedTree.push(...pages.filter((p) => !p.group && !p.hidden).map(node));
  return { tree: groupedTree, pages };
}
