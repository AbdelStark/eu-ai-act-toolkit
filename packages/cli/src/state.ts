import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import type { StateFile } from '@eu-ai-act/sdk';

const STATE_FILENAME = '.eu-ai-act.json';
const STATE_VERSION = '1.0.0';

/**
 * Walk up from startDir to find .eu-ai-act.json.
 * Returns the full path or null if not found.
 */
export function findStateFile(startDir: string = process.cwd()): string | null {
  let dir = resolve(startDir);
  const root = resolve('/');

  while (dir !== root) {
    const candidate = resolve(dir, STATE_FILENAME);
    if (existsSync(candidate)) return candidate;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  return null;
}

/**
 * Read and parse the state file. Returns null if not found.
 * Validates the version field and provides defaults for missing fields.
 */
export function readState(startDir?: string): StateFile | null {
  const path = findStateFile(startDir);
  if (!path) return null;

  const raw = readFileSync(path, 'utf-8');
  const parsed = JSON.parse(raw) as StateFile;

  // Forward-compatible: ignore unknown fields, provide defaults
  if (!parsed.version) parsed.version = STATE_VERSION;
  if (!parsed.checklist) parsed.checklist = {};

  return parsed;
}

/**
 * Write state to .eu-ai-act.json in the current directory.
 */
export function writeState(state: StateFile, dir: string = process.cwd()): string {
  const path = resolve(dir, STATE_FILENAME);
  writeFileSync(path, JSON.stringify(state, null, 2) + '\n', 'utf-8');
  return path;
}

/**
 * Create a fresh state file with classification results.
 */
export function createState(
  systemName: string,
  provider: string,
  classification: StateFile['classification'],
): StateFile {
  return {
    version: STATE_VERSION,
    system: {
      name: systemName,
      provider,
      classifiedAt: new Date().toISOString(),
    },
    classification,
    checklist: {},
  };
}
