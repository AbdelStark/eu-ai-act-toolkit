#!/usr/bin/env node

/**
 * Validate all data/*.json files against their JSON Schema definitions.
 * Run: node scripts/validate-data.mjs
 */

import { readFileSync, readdirSync } from 'node:fs';
import { resolve, basename } from 'node:path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const dataDir = resolve(import.meta.dirname, '..', 'data');
const schemaDir = resolve(dataDir, 'schema');

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const schemas = readdirSync(schemaDir)
  .filter((f) => f.endsWith('.schema.json'));

let hasErrors = false;

for (const schemaFile of schemas) {
  const dataName = schemaFile.replace('.schema.json', '.json');
  const dataPath = resolve(dataDir, dataName);
  const schemaPath = resolve(schemaDir, schemaFile);

  try {
    const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
    const data = JSON.parse(readFileSync(dataPath, 'utf-8'));
    const validate = ajv.compile(schema);
    const valid = validate(data);

    if (valid) {
      console.log(`✓ ${dataName} — valid`);
    } else {
      console.error(`✗ ${dataName} — INVALID`);
      for (const error of validate.errors ?? []) {
        console.error(`  ${error.instancePath} ${error.message}`);
      }
      hasErrors = true;
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.warn(`⚠ ${dataName} — file not found, skipping`);
    } else {
      console.error(`✗ ${dataName} — error: ${err.message}`);
      hasErrors = true;
    }
  }
}

process.exit(hasErrors ? 1 : 0);
