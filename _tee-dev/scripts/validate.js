const fs = require("fs");
const path = require("path");

const appRoot = path.resolve(__dirname, "..");
const projectRoot = path.resolve(appRoot, "..");
const root = path.join(appRoot, "site");
const logDir = path.join(projectRoot, "logs");
const logFile = path.join(logDir, "validate.log");
const fallbackLogFile = path.join(logDir, `validate-${Date.now()}.log`);
const requiredFiles = ["index.html", "styles.css", "app.js"];

fs.mkdirSync(logDir, { recursive: true });

function log(message) {
  const line = `[${new Date().toISOString()}] ${message}\n`;
  try {
    fs.appendFileSync(logFile, line);
  } catch (error) {
    fs.appendFileSync(fallbackLogFile, line);
  }
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
