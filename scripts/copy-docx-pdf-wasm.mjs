import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);

let src;
try {
  const pkgDir = join(dirname(require.resolve('docx-to-pdf-wasm/package.json')));
  const opt = join(pkgDir, 'build', 'docx-to-pdf.opt.wasm');
  const raw = join(pkgDir, 'build', 'docx-to-pdf.wasm');
  src = existsSync(opt) ? opt : raw;
} catch {
  console.error('docx-to-pdf-wasm is not installed. Run: npm install docx-to-pdf-wasm');
  process.exit(1);
}

const destDir = join(root, 'src', 'lib', 'pelayanan');
const dest = join(destDir, 'docx-to-pdf.wasm');
mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);
console.log(`Copied ${src} → ${dest}`);
