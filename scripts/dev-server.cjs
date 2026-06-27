const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");

const root = path.resolve(__dirname, "..");
const port = Number(process.env.PORT) || 4173;
const publicFiles = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["index.html", "text/html; charset=utf-8"]],
  ["/styles.css", ["styles.css", "text/css; charset=utf-8"]],
  ["/app.js", ["app.js", "text/javascript; charset=utf-8"]]
]);

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || `127.0.0.1:${port}`}`);

  if (url.pathname.startsWith("/api/")) {
    const route = url.pathname.replace(/^\/api\//, "").replace(/\/$/, "") || "index";
    const apiPath = path.join(root, "api", `${route}.js`);
    req.query = Object.fromEntries(url.searchParams);
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    res.json = (payload) => {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify(payload));
      return payload;
    };
    try {
      const handler = require(apiPath);
      await handler(req, res);
    } catch (error) {
      res.statusCode = error.code === "MODULE_NOT_FOUND" ? 404 : 500;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ error: res.statusCode === 404 ? "API route not found" : "API route error" }));
    }
    return;
  }

  const target = publicFiles.get(url.pathname) || publicFiles.get("/");
  try {
    const content = await fs.readFile(path.join(root, target[0]));
    res.statusCode = 200;
    res.setHeader("Content-Type", target[1]);
    res.end(content);
  } catch {
    res.statusCode = 500;
    res.end("Preview server error");
  }
});

server.listen(port, "0.0.0.0", () => {
  const lanUrls = Object.values(os.networkInterfaces())
    .flat()
    .filter((item) => item && item.family === "IPv4" && !item.internal)
    .map((item) => `http://${item.address}:${port}`);
  console.log(`Local preview: http://127.0.0.1:${port}`);
  lanUrls.forEach((url) => console.log(`Mobile preview: ${url}`));
});
