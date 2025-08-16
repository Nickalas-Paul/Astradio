/**
 * Scans TS/TSX files for bare imports and verifies each exists in the nearest package.json
 * (dependencies or devDependencies). Fails with a clear message if not installed or missing @types.
 */
import { readFileSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";

const IGNORED_DIRS = new Set(["node_modules", "dist", ".next", "coverage", ".git"]);
const EXTS = new Set([".ts", ".tsx"]);
const BARE_IMPORT_RE =
  /(?:import|export)\s+(?:[^'"]*from\s+)?["']([^"']+)["']|require\(\s*["']([^"']+)["']\s*\)/g;

// Node.js built-in modules that don't need to be in package.json
const NODE_BUILTINS = new Set([
  "fs", "path", "crypto", "http", "https", "url", "querystring", "stream", "events",
  "util", "buffer", "os", "child_process", "cluster", "dgram", "dns", "domain",
  "module", "net", "readline", "repl", "string_decoder", "tls", "tty", "v8", "vm",
  "zlib", "assert", "constants", "punycode", "timers", "tty", "url", "querystring"
]);

function walk(dir: string, files: string[] = []) {
  for (const item of readdirSync(dir)) {
    if (IGNORED_DIRS.has(item)) continue;
    const p = join(dir, item);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, files);
    else if (EXTS.has(p.slice(p.lastIndexOf(".")))) files.push(p);
  }
  return files;
}

function readPkgJson(start: string) {
  let curr = start;
  while (true) {
    try {
      const pkgPath = join(curr, "package.json");
      const json = JSON.parse(readFileSync(pkgPath, "utf8"));
      return { json, pkgPath };
    } catch {
      const parent = dirname(curr);
      if (parent === curr) return null;
      curr = parent;
    }
  }
}

const root = process.cwd();
const problems: string[] = [];

for (const file of walk(root)) {
  const text = readFileSync(file, "utf8");
  let m: RegExpExecArray | null;
  while ((m = BARE_IMPORT_RE.exec(text))) {
    const spec = (m[1] || m[2])!;
    if (!spec || spec.startsWith(".") || spec.startsWith("/")) continue; // ignore relative
    const pkgName = spec.split("/")[0].startsWith("@")
      ? spec.split("/").slice(0, 2).join("/")
      : spec.split("/")[0];
    
    // Skip Node.js built-ins
    if (NODE_BUILTINS.has(pkgName)) continue;
    
    const pkgInfo = readPkgJson(dirname(file));
    if (!pkgInfo) continue;
    const { json, pkgPath } = pkgInfo;
    const deps = { ...(json.dependencies || {}), ...(json.devDependencies || {}) };

    if (!deps[pkgName]) {
      problems.push(
        `[${file}] imports "${spec}" but "${pkgName}" is not declared in ${pkgPath} dependencies.`
      );
    }
  }
}

if (problems.length) {
  console.error("\nDependency Guard: Missing declarations detected:\n");
  for (const p of problems) console.error(" - " + p);
  console.error(
    "\nFix: install the missing package in the owning package.json (pnpm -F <pkg> add <name>)\n" +
      "and, if it lacks types, add either @types/<name> or an ambient .d.ts.\n"
  );
  process.exit(1);
} else {
  console.log("Dependency Guard: OK");
}
