/**
 * Typed loader for config/base.yaml. Used by Node scripts and Vite, not by
 * the production drop-in files (those must stay bundler-free).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

/**
 * @typedef {object} DemoConfig
 * @property {number} port TCP port for the local Vite preview.
 * @property {number} sidebar_width_px Open sidebar width in the mock shell.
 * @property {number} mobile_max_px Drawer breakpoint shared with production assets.
 */

/**
 * @typedef {object} PackConfig
 * @property {string[]} files Files copied from assets/ into download/.
 * @property {string} zip_name Zip filename written next to those copies.
 */

/**
 * @typedef {object} AppConfig
 * @property {DemoConfig} demo
 * @property {PackConfig} pack
 */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Reads and validates config/base.yaml.
 *
 * @returns {AppConfig} Frozen config object.
 * @throws {Error} If a required key is missing or the wrong type.
 */
export function loadConfig() {
  const raw = parse(readFileSync(join(ROOT, "config", "base.yaml"), "utf8"));
  if (!raw || typeof raw !== "object") {
    throw new Error("config/base.yaml is empty or not an object.");
  }
  const demo = requireObject(raw, "demo");
  const pack = requireObject(raw, "pack");
  const config = {
    demo: {
      port: requirePositiveInt(demo, "port"),
      sidebar_width_px: requirePositiveInt(demo, "sidebar_width_px"),
      mobile_max_px: requirePositiveInt(demo, "mobile_max_px"),
    },
    pack: {
      files: requireStringList(pack, "files"),
      zip_name: requireNonEmptyString(pack, "zip_name"),
    },
  };
  return Object.freeze(config);
}

/**
 * @param {Record<string, unknown>} source
 * @param {string} key
 * @returns {Record<string, unknown>}
 */
function requireObject(source, key) {
  const value = source[key];
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`config.${key} must be an object.`);
  }
  return /** @type {Record<string, unknown>} */ (value);
}

/**
 * @param {Record<string, unknown>} source
 * @param {string} key
 * @returns {number}
 */
function requirePositiveInt(source, key) {
  const value = source[key];
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new Error(`config.${key} must be a positive integer.`);
  }
  return value;
}

/**
 * @param {Record<string, unknown>} source
 * @param {string} key
 * @returns {string}
 */
function requireNonEmptyString(source, key) {
  const value = source[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`config.${key} must be a non-empty string.`);
  }
  return value;
}

/**
 * @param {Record<string, unknown>} source
 * @param {string} key
 * @returns {string[]}
 */
function requireStringList(source, key) {
  const value = source[key];
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.some((item) => typeof item !== "string")
  ) {
    throw new Error(`config.${key} must be a non-empty list of strings.`);
  }
  return value;
}
