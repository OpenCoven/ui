import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.argv[2] ?? "apps/specimens/dist");
const port = Number(process.argv[3] ?? 4321);

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".map": "application/json; charset=utf-8",
};

createServer(async (request, response) => {
  const requested = decodeURIComponent(
    new URL(request.url, "http://x").pathname,
  );
  const candidate = path.join(root, requested);

  for (const file of [candidate, path.join(root, "index.html")]) {
    if (!path.resolve(file).startsWith(root)) continue;
    try {
      const body = await readFile(file);
      response.writeHead(200, {
        "content-type": types[path.extname(file)] ?? "application/octet-stream",
        "cache-control": "no-store",
      });
      response.end(body);
      return;
    } catch {
      // fall through to SPA index
    }
  }

  response.writeHead(404, { "content-type": "text/plain" });
  response.end("not found");
}).listen(port, "127.0.0.1", () => {
  console.log(`serving ${root} on http://127.0.0.1:${port}`);
});
