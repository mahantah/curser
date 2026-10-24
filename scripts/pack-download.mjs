/**
 * Keeps download/ in sync with assets/. assets/ is the source of truth;
 * download/ is the published pack for GitHub.
 */
import { execFileSync } from "node:child_process";
import { copyFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig } from "../config/load.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CHECK_ONLY = process.argv.includes("--check");

/**
 * Copies the four production files into download/ and rebuilds the zip,
 * or exits non-zero when --check finds drift.
 *
 * @returns {void}
 */
function main() {
  const { pack } = loadConfig();
  const zipPath = join(ROOT, "download", pack.zip_name);
  let drifted = false;

  for (const name of pack.files) {
    const from = join(ROOT, "assets", name);
    const to = join(ROOT, "download", name);
    const source = readFileSync(from);
    const published = safeRead(to);
    if (!published || !source.equals(published)) {
      drifted = true;
      if (!CHECK_ONLY) {
        copyFileSync(from, to);
      }
    }
  }

  if (CHECK_ONLY) {
    if (drifted) {
      throw new Error("download/ is out of date. Run `npm run pack`.");
    }
    return;
  }

  execFileSync(
    "zip",
    ["-j", "-q", zipPath, ...pack.files.map((name) => join(ROOT, "download", name))],
    { cwd: ROOT },
  );
}

/**
 * @param {string} path
 * @returns {Buffer | null}
 */
function safeRead(path) {
  try {
    return readFileSync(path);
  } catch {
    return null;
  }
}

main();
