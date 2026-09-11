import { spawn } from "node:child_process";
import { watch } from "node:fs";
import { fileURLToPath } from "node:url";
import { syncMedia, mediaSource } from "./sync-media.mjs";

const help = process.argv.includes("--help") || process.argv.includes("-h");
if (!help) await syncMedia();
let pending = Promise.resolve();
let timer;
let watcher;
function watchFailed(error) {
  watcher?.close();
  console.warn(`Media watching unavailable (${error.code}). Run npm --prefix frontend run sync-media after changing assets.`);
}
if (!help) {
  try {
    watcher = watch(mediaSource, { recursive: true }, () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    pending = pending.then(() => syncMedia()).catch((error) => console.error("Media sync failed:", error));
  }, 150);
    });
    watcher.on("error", watchFailed);
  } catch (error) {
    watchFailed(error);
  }
}
const child = spawn(process.execPath, [fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url)),
  "dev", "--webpack", "-p", "3002", ...process.argv.slice(2)], { stdio: "inherit" });
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
child.on("exit", (code) => { watcher?.close(); clearTimeout(timer); process.exit(code ?? 0); });
