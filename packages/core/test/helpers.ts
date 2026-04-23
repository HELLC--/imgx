import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(__dirname, "fixtures");

export const FIXTURE_PNG = join(FIXTURES, "success.png");
export const FIXTURE_JPG = join(
  FIXTURES,
  "sample.jpg",
);

// Real source dimensions
export const PNG_WIDTH = 540;
export const PNG_HEIGHT = 540;

// JPEG is pre-resized to keep snapshot sizes manageable
export const JPG_WIDTH = 400;
export const JPG_HEIGHT = 267;

let pngCache: Buffer | undefined;
let jpgCache: Buffer | undefined;

export async function loadFixturePng(): Promise<Buffer> {
  if (!pngCache) pngCache = await readFile(FIXTURE_PNG);
  return pngCache;
}

export async function loadFixtureJpeg(): Promise<Buffer> {
  if (!jpgCache) {
    const raw = await readFile(FIXTURE_JPG);
    jpgCache = await sharp(raw)
      .resize({ width: JPG_WIDTH })
      .jpeg({ quality: 80, mozjpeg: false })
      .toBuffer();
  }
  return jpgCache;
}

export async function getMetadata(buffer: Buffer) {
  return sharp(buffer).metadata();
}

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname as _dirname, isAbsolute, resolve } from "node:path";
import { expect } from "vitest";

/**
 * Compare a binary Buffer against a snapshot file. Writes raw bytes (so the
 * image opens in any viewer). Update with `vitest -u` or env UPDATE_SNAPSHOTS=1.
 *
 * @param actual The image buffer produced by the test
 * @param snapshotPath Path relative to the calling test file (e.g. './__snapshots__/blur/r10-s5.jpg')
 *                    or an absolute path.
 */
export function matchImageSnapshot(actual: Buffer, snapshotPath: string): void {
  // Resolve relative to the test file that called us.
  const callerFile = getCallerFile();
  const fullPath = isAbsolute(snapshotPath)
    ? snapshotPath
    : resolve(_dirname(callerFile), snapshotPath);

  const updateMode = expect.getState().snapshotState?.["_updateSnapshot"] as
    | "all"
    | "new"
    | "none"
    | undefined;
  const shouldUpdate =
    process.env.UPDATE_SNAPSHOTS === "1" || updateMode === "all";

  if (!existsSync(fullPath) || shouldUpdate) {
    mkdirSync(_dirname(fullPath), { recursive: true });
    writeFileSync(fullPath, actual);
    const snapshotState = expect.getState().snapshotState;
    if (snapshotState) (snapshotState["added"] as any)++;
    return;
  }

  const expected = readFileSync(fullPath);
  if (!actual.equals(expected)) {
    throw new Error(
      `Image snapshot mismatch at ${snapshotPath}\n` +
        `  expected: ${expected.length} bytes\n` +
        `  actual:   ${actual.length} bytes\n` +
        `  Run with UPDATE_SNAPSHOTS=1 (or 'vitest -u') to update.`,
    );
  }
}

function getCallerFile(): string {
  const orig = Error.prepareStackTrace;
  Error.prepareStackTrace = (_e, stack) => stack;
  const err = new Error();
  const stack = err.stack as unknown as NodeJS.CallSite[];
  Error.prepareStackTrace = orig;
  // Walk the stack until we leave helpers.ts
  for (const frame of stack.slice(1)) {
    const f = frame.getFileName();
    if (f && !f.endsWith("helpers.ts")) {
      return f.startsWith("file://") ? fileURLToPath(f) : f;
    }
  }
  return __dirname;
}
