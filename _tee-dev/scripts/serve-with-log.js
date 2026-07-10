const http = require("http");
const fs = require("fs");
const path = require("path");

const appRoot = path.resolve(__dirname, "..");
const projectRoot = path.resolve(appRoot, "..");
const root = path.join(appRoot, "site");
const logDir = path.join(projectRoot, "logs");
const storefrontFolders = {
  big: "full-front",
  small: "left-chest"
};
const imageExtensions = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".svg", ".webp"]);
const port = Number(process.env.PORT || 4173);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

fs.mkdirSync(logDir, { recursive: true });
const logFile = path.join(logDir, "serve.log");
const fallbackLogFile = path.join(logDir, `serve-${Date.now()}.log`);

function log(message) {
  const line = `[${new Date().toISOString()}] ${message}\n`;
  try {
    fs.appendFileSync(logFile, line);
  } catch (error) {
    fs.appendFileSync(fallbackLogFile, line);
  }
}

function sendJson(response, status, payload) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function readRequestBody(request, response, callback) {
  let body = "";
  request.on("data", (chunk) => {
    body += chunk;
    if (body.length > 12 * 1024 * 1024) {
      response.writeHead(413);
      response.end("Payload too large");
      request.destroy();
    }
  });
  request.on("end", () => callback(body));
}

function titleFromFile(fileName) {
  return path
    .basename(fileName, path.extname(fileName))
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getStorefrontDesigns() {
  return Object.entries(storefrontFolders).flatMap(([placement, folder]) => {
    const folderPath = path.join(projectRoot, folder);
    fs.mkdirSync(folderPath, { recursive: true });
    const files = fs
      .readdirSync(folderPath, { withFileTypes: true })
      .filter((entry) => entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase()))
      .map((entry) => ({
        id: `${folder}/${entry.name}`,
        name: titleFromFile(entry.name),
        creator: "Owner Studio",
        placement,
        imageUrl: `/designs/${folder}/${encodeURIComponent(entry.name)}`,
        sourceFolder: folder,
        description: `Sourced from ${folder}/${entry.name}.`
      }));

    return files.length ? files : [{
      id: `${folder}/placeholder`,
      name: placement === "big" ? "Full-front folder" : "Left-chest folder",
      creator: "Owner Studio",
      placement,
      imageUrl: "",
      sourceFolder: folder,
      description: `Add artwork files to ${folder}/ to populate this storefront lane.`
    }];
  });
}

function serveDesignAsset(request, response, cleanUrl) {
  const match = cleanUrl.match(/^\/designs\/(full-front|left-chest)\/(.+)$/);
  if (!match) return false;

  const folder = match[1];
  const fileName = path.basename(decodeURIComponent(match[2]));
  const filePath = path.normalize(path.join(projectRoot, folder, fileName));
  const folderPath = path.join(projectRoot, folder);

  if (!filePath.startsWith(folderPath) || !imageExtensions.has(path.extname(filePath).toLowerCase())) {
    log(`403 ${request.url}`);
    response.writeHead(403);
    response.end("Forbidden");
    return true;
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
      "content-type": types[path.extname(filePath).toLowerCase()] || "application/octet-stream"
    });
    response.end(data);
  });
  return true;
}

const server = http.createServer((request, response) => {
  const cleanUrl = decodeURIComponent(request.url.split("?")[0]);

  if (request.method === "GET" && cleanUrl === "/api/storefront-designs") {
    log(`200 ${request.url}`);
    sendJson(response, 200, { designs: getStorefrontDesigns() });
    return;
  }

  if (request.method === "POST" && cleanUrl === "/api/design-submissions") {
    readRequestBody(request, response, (body) => {
      try {
        const entry = JSON.parse(body);
        const savedEntry = {
          id: entry.id,
          name: entry.name,
          creator: entry.creator,
          placement: entry.placement,
          imageSource: entry.imageSource,
          imageUrl: entry.imageUrl,
          imageFileName: entry.imageFileName,
          imageWidth: entry.imageWidth,
          imageHeight: entry.imageHeight,
          imageData: entry.imageData,
          createdAt: entry.createdAt,
          storedAt: new Date().toISOString()
        };
        fs.appendFileSync(path.join(logDir, "submissions.jsonl"), `${JSON.stringify(savedEntry)}\n`);
        log(`201 ${request.url}`);
        sendJson(response, 201, { ok: true });
      } catch (error) {
        log(`400 ${request.url}`);
        sendJson(response, 400, { ok: false, error: "Invalid submission" });
      }
    });
    return;
  }

  if (request.method === "GET" && serveDesignAsset(request, response, cleanUrl)) {
    return;
  }

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
