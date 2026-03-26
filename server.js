const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

// Load API handlers
const joinHandler = require("./api/waitlist/join");
const countHandler = require("./api/waitlist/count");
const listHandler = require("./api/waitlist/list");
const updateStatusHandler = require("./api/waitlist/update-status");
const deleteHandler = require("./api/waitlist/delete");

const PORT = process.env.PORT || 4000;

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function parseBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  // API routes
  if (pathname.startsWith("/api/")) {
    req.body = await parseBody(req);

    const apiRoutes = {
      "/api/waitlist/join": joinHandler,
      "/api/waitlist/count": countHandler,
      "/api/waitlist/list": listHandler,
      "/api/waitlist/update-status": updateStatusHandler,
      "/api/waitlist/delete": deleteHandler,
    };

    const handler = apiRoutes[pathname];
    if (handler) {
      // Create a mock res object compatible with Vercel's API
      const mockRes = {
        statusCode: 200,
        headers: {},
        setHeader(key, val) { this.headers[key] = val; },
        status(code) { this.statusCode = code; return this; },
        json(data) {
          res.writeHead(this.statusCode, { ...this.headers, "Content-Type": "application/json" });
          res.end(JSON.stringify(data));
        },
        end() {
          res.writeHead(this.statusCode, this.headers);
          res.end();
        },
      };

      try {
        await handler(req, mockRes);
      } catch (err) {
        console.error("API error:", err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Internal server error" }));
      }
      return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
    return;
  }

  // Static file serving
  let filePath;
  if (pathname === "/" || pathname === "/landing") {
    filePath = path.join(__dirname, "public", "index.html");
  } else if (pathname === "/admin") {
    filePath = path.join(__dirname, "public", "admin.html");
  } else {
    filePath = path.join(__dirname, "public", pathname);
  }

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  } catch {
    res.writeHead(404, { "Content-Type": "text/html" });
    res.end("<h1>404 Not Found</h1>");
  }
});

server.listen(PORT, () => {
  console.log(`LeadEdge AI Website running at http://localhost:${PORT}`);
  console.log(`  Landing page: http://localhost:${PORT}/`);
  console.log(`  Admin dashboard: http://localhost:${PORT}/admin`);
});
