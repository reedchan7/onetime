import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Add CommonJS compatibility to the CommonJS build
const cjsPath = join(process.cwd(), 'dist', 'index.cjs');
const cjsContent = readFileSync(cjsPath, 'utf8');

// Replace the last line (exports.default = onetime;) with proper CommonJS exports
const modifiedContent = cjsContent.replace(
  'exports.default = onetime;',
  `// CommonJS exports
module.exports = onetime;
module.exports.default = onetime;
module.exports.callCount = onetime.callCount;`
);

writeFileSync(cjsPath, modifiedContent);
console.log('✅ Added CommonJS compatibility to dist/index.cjs');
