import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  renameSync,
  rmSync,
} from "fs";
import { join } from "path";

// Move compiled CJS artifacts from dist/cjs to dist and fix imports
const distDir = join(process.cwd(), "dist");
const cjsDir = join(distDir, "cjs");
const cjsIndexJs = join(cjsDir, "index.js");
const cjsMimicJs = join(cjsDir, "mimic-function.js");
const outIndexCjs = join(distDir, "index.cjs");
const outMimicCjs = join(distDir, "mimic-function.cjs");

if (existsSync(cjsIndexJs)) {
  // Move index.js -> index.cjs
  renameSync(cjsIndexJs, outIndexCjs);
}

if (existsSync(cjsMimicJs)) {
  // Move mimic-function.js -> mimic-function.cjs
  renameSync(cjsMimicJs, outMimicCjs);
}

// Remove temporary cjs directory if empty/exists
if (existsSync(cjsDir)) {
  try {
    rmSync(cjsDir, { recursive: true, force: true });
  } catch {}
}

// Read output CJS for post-processing
const cjsPath = outIndexCjs;
const cjsContent = readFileSync(cjsPath, "utf8");

// Replace the last line (exports.default = onetime;) with proper CommonJS exports
let modifiedContent = cjsContent;

// Fix import path to use .cjs file
modifiedContent = modifiedContent.replace(
  "./mimic-function.js",
  "./mimic-function.cjs",
);

// Ensure CommonJS exports shape
modifiedContent = modifiedContent.replace(
  "exports.default = onetime;",
  `// CommonJS exports
module.exports = onetime;
module.exports.default = onetime;
module.exports.callCount = onetime.callCount;`,
);

writeFileSync(cjsPath, modifiedContent);
console.log(
  "✅ Finalized CommonJS build: dist/index.cjs + dist/mimic-function.cjs",
);
