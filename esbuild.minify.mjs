/**
 * esbuild.minify.mjs
 * ------------------
 * Simple ESBuild script to recursively minify compiled JS files
 * from /build/js into /dist/js (preserving directory structure).
 */

import { build } from "esbuild";
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

/**
 * Recursively walk a directory and collect all .js file paths.
 */
async function collectJsFiles(dir, files = []) {
  for (const entry of await readdir(dir)) {
    const fullPath = join(dir, entry);
    const fileStat = await stat(fullPath);
    if (fileStat.isDirectory()) {
      await collectJsFiles(fullPath, files);
    } else if (fullPath.endsWith(".js")) {
      files.push(fullPath);
    }
  }
  return files;
}

// Gather all compiled JS files under /build/js
const jsFiles = await collectJsFiles("build/js");

// Run ESBuild to minify everything into /dist/js
await build({
  entryPoints: jsFiles,
  outdir: "dist/js",
  format: "esm",
  bundle: false,
  minify: true,
  sourcemap: false,
});

console.log(`✅ Minified ${jsFiles.length} files → dist/js`);
