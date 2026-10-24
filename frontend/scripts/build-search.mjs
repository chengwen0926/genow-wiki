import { spawnSync } from "node:child_process";
import { cp, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const result = spawnSync(process.execPath, [fileURLToPath(new URL("../node_modules/pagefind/lib/runner/bin.cjs", import.meta.url)),
  "--site", "out", "--glob", "wiki/**/index.html"], { stdio: "inherit" });
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
// A copy makes the last built index available to Next's local development server.
await rm("public/pagefind", { recursive: true, force: true });
await cp("out/pagefind", "public/pagefind", { recursive: true });
