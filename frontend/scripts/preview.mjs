import http from "node:http";
import { access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import send from "next/dist/compiled/send/index.js";

const root = fileURLToPath(new URL("../out/", import.meta.url));
try {
  await access(`${root}/index.html`);
} catch {
  console.error("未找到构建产物，请先在项目根目录运行 npm run build。");
  process.exit(1);
}
const production = process.argv.includes("--production");
const host = production ? "0.0.0.0" : "127.0.0.1";
const portIndex = process.argv.indexOf("--port");
let port = Number(portIndex >= 0 ? process.argv[portIndex + 1] : 3002);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error("端口必须为 1–65535 的整数。");
  process.exit(1);
}
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
  if (error.code === "EADDRINUSE" && !production && port < 65535) server.listen(++port, host);
  else if (error.code === "EADDRINUSE") {
    console.error(`端口 ${port} 已被占用，服务未启动。请先确认并停止该端口上的旧 Wiki 服务，然后重试；不会自动换端口或终止其他进程。`);
    process.exit(1);
  }
  else { console.error(error); process.exit(1); }
});
server.on("listening", () => console.log(`${production ? "Wiki server" : "Static preview"}: http://${host}:${port}`));
server.listen(port, host);
