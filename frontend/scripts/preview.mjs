import http from "node:http";
import { access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import send from "next/dist/compiled/send/index.js";

const root = fileURLToPath(new URL("../out/", import.meta.url));
await access(`${root}/index.html`);
const portIndex = process.argv.indexOf("--port");
let port = Number(portIndex >= 0 ? process.argv[portIndex + 1] : 3002);
const server = http.createServer((request, response) => {
  if (!["GET", "HEAD"].includes(request.method)) {
    response.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }
  const pathname = new URL(request.url, "http://localhost").pathname;
  const stream = send(request, pathname, { root, index: "index.html", dotfiles: "deny" });
  stream.on("directory", () => {
    response.writeHead(308, { Location: `${pathname}/` }).end();
  });
  stream.on("headers", (res) => res.setHeader("Cache-Control", pathname.startsWith("/_next/static/")
    ? "public, max-age=31536000, immutable" : "no-cache"));
  stream.on("error", (error) => {
    response.statusCode = error.statusCode ?? 500;
    if (response.statusCode === 404) {
      send(request, "/404.html", { root }).pipe(response);
    } else response.end(http.STATUS_CODES[response.statusCode]);
  });
  stream.pipe(response);
});
server.on("error", (error) => {
  if (error.code === "EADDRINUSE") server.listen(++port, "127.0.0.1");
  else { console.error(error); process.exit(1); }
});
server.on("listening", () => console.log(`Static preview: http://localhost:${port}`));
server.listen(port, "127.0.0.1");
