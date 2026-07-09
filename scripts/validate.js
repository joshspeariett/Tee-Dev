const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const logDir = path.join(root, "logs");
const logFile = path.join(logDir, "validate.log");
const requiredFiles = ["index.html", "styles.css", "app.js", "package.json"];

fs.mkdirSync(logDir, { recursive: true });

function log(message) {
  fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${message}\n`);
}

let failed = false;

for (const file of requiredFiles) {
  const filePath = path.join(root, file);
  if (!fs.existsSync(filePath)) {
    failed = true;
    log(`Missing ${file}`);
  } else {
    log(`Found ${file}`);
  }
}

const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
for (const id of ["owner", "community", "submit", "ledger"]) {
  if (!html.includes(`id="${id}"`)) {
    failed = true;
    log(`Missing section id ${id}`);
  }
}

if (failed) {
  log("Validation failed");
  process.exitCode = 1;
} else {
  log("Validation passed");
  console.log(`Validation passed. Details written to ${logFile}`);
}
