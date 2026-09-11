import { cp, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const mediaSource = fileURLToPath(new URL("../../assets/", import.meta.url));
export const mediaOutput = fileURLToPath(new URL("../public/media/", import.meta.url));

export async function syncMedia(source = mediaSource, destination = mediaOutput) {
  const entries = (await readdir(source, { withFileTypes: true }))
    .filter((entry) => !entry.name.startsWith(".") && !entry.isSymbolicLink());
  await mkdir(destination, { recursive: true });
  const names = new Set(entries.map((entry) => entry.name));
  for (const name of await readdir(destination)) {
    if (!names.has(name)) await rm(path.join(destination, name), { recursive: true, force: true });
  }
  for (const entry of entries) {
    const from = path.join(source, entry.name);
    const to = path.join(destination, entry.name);
    if (entry.isDirectory()) await syncMedia(from, to);
    else await cp(from, to);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await syncMedia();
  console.log("Media synced to public/media/");
}
