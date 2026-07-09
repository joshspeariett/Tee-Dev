const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const logDir = path.join(root, "logs");
const port = Number(process.env.PORT || 4173);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

fs.mkdirSync(logDir, { recursive: true });
const logFile = path.join(logDir, "serve.log");

function log(message) {
  fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${message}\n`);
}

const server = http.createServer((request, response) => {
  const cleanUrl = decodeURIComponent(request.url.split("?")[0]);
  const requestedPath = cleanUrl === "/" ? "/index.html" : cleanUrl;
  const filePath = path.normalize(path.join(root, requestedPath));

  if (!filePath.startsWith(root)) {
    log(`403 ${request.url}`);
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      log(`404 ${request.url}`);
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    log(`200 ${request.url}`);
    response.writeHead(200, {
      "content-type": types[path.extname(filePath)] || "application/octet-stream"
    });
    response.end(data);
  });
});

server.listen(port, () => {
  log(`Server started on http://localhost:${port}`);
  console.log(`Tee Dev running at http://localhost:${port}`);
  console.log(`Requests are logged to ${logFile}`);
});

setInterval(() => {}, 2147483647);
