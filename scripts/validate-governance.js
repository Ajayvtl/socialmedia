const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const enforceMode = args.includes("--enforce");

const SOURCE_DIR = path.join(__dirname, "../src");
const IGNORED_PATHS = [
  path.join(SOURCE_DIR, "app/globals.css"),
  path.join(SOURCE_DIR, "components/ui/Button.tsx"),
  path.join(SOURCE_DIR, "context/Web3Modal.tsx")
];

// Hex color validator regex
const HEX_COLOR_REGEX = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\b/g;

// Hardcoded Tailwind colors validator regex
const TAILWIND_COLOR_REGEX = /\b(bg|text|border|ring|from|to|via)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+/g;

// Active console.log checks
const CONSOLE_LOG_REGEX = /\bconsole\.log\(/g;

let violationsCount = 0;

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else if (stat.isFile() && /\.(tsx|ts|js|jsx)$/.test(file)) {
      if (IGNORED_PATHS.some((ignored) => fullPath.includes(ignored))) {
        continue;
      }
      checkFileCompliance(fullPath);
    }
  }
}

function checkFileCompliance(filePath) {
  const relativePath = path.relative(path.join(__dirname, ".."), filePath);
  const content = fs.readFileSync(filePath, "utf-8");

  // 1. Check Hex Colors
  let match;
  while ((match = HEX_COLOR_REGEX.exec(content)) !== null) {
    const matchedHex = match[0];
    const isAddress = matchedHex.length === 42 || matchedHex.startsWith("#x");
    if (!isAddress) {
      console.warn(
        `[Governance Warning] Hex color "${matchedHex}" found in ${relativePath} at index ${match.index}. Use CSS design variables.`
      );
      violationsCount++;
    }
  }

  // 2. Check Tailwind Color Overrides
  while ((match = TAILWIND_COLOR_REGEX.exec(content)) !== null) {
    const matchedClass = match[0];
    console.warn(
      `[Governance Warning] Hardcoded Tailwind color class "${matchedClass}" found in ${relativePath}. Use semantic theme variables (e.g. text-foreground).`
    );
    violationsCount++;
  }

  // 3. Check Active Console Logs
  while ((match = CONSOLE_LOG_REGEX.exec(content)) !== null) {
    console.warn(
      `[Governance Warning] console.log() found in ${relativePath}. Use logging interfaces or telemetryService.`
    );
    violationsCount++;
  }
}

console.log(`Starting Platform Governance Compliance scan [Enforce Mode: ${enforceMode}]...`);
scanDirectory(SOURCE_DIR);

if (violationsCount > 0) {
  console.log(`\nScan finished: ${violationsCount} governance issues flagged.`);
  if (enforceMode) {
    console.error("Enforce mode active: Failing build due to governance violations.");
    process.exit(1);
  }
} else {
  console.log("\nSuccess: All scanned files are fully compliant with Aurora Platform Governance rules.");
}
process.exit(0);
