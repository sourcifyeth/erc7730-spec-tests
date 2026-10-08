#!/usr/bin/env node
// Checks every test file under tests/:
//   - it validates against schema/erc7730-tests.schema.json
//   - specVersion equals the version folder it sits in
//   - every case has an id, and ids are unique across the suite
//   - descriptor paths resolve to files that parse as JSON
//   - a calldata case with a `call` block has the rawTx that tools/encode-call.mjs builds from it
//   - a case that points at the spec keeps its section non-empty
//
// Exit code 1 when anything fails. Run with `npm run check`.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { encodeCall } from './encode-call.mjs';

const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
const schema = JSON.parse(readFileSync(join(root, 'schema/erc7730-tests.schema.json'), 'utf8'));
// allErrors is off on purpose: the top-level oneOf would otherwise report every branch's errors for every case.
const ajv = new Ajv({ allErrors: false, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (name.endsWith('.tests.json')) yield p;
  }
}

const problems = [];
const ids = new Map();
let files = 0;
let cases = 0;

for (const file of walk(join(root, 'tests'))) {
  files++;
  const rel = relative(root, file);
  let doc;
  try {
    doc = JSON.parse(readFileSync(file, 'utf8'));
  } catch (e) {
    problems.push(`${rel}: not JSON: ${e.message}`);
    continue;
  }
  if (!validate(doc)) {
    for (const err of validate.errors) problems.push(`${rel}: ${err.instancePath || '/'} ${err.message}`);
    continue;
  }
  const folderVersion = rel.split('/')[1];
  if (doc.specVersion !== folderVersion) {
    problems.push(`${rel}: specVersion "${doc.specVersion}" but the file is in tests/${folderVersion}/`);
  }
  const resolveDescriptor = (p, where) => {
    const abs = resolve(dirname(file), p);
    if (!existsSync(abs)) {
      problems.push(`${rel}: ${where} descriptor "${p}" does not exist`);
      return;
    }
    try {
      JSON.parse(readFileSync(abs, 'utf8'));
    } catch (e) {
      problems.push(`${rel}: ${where} descriptor "${p}" is not JSON: ${e.message}`);
    }
  };
  if (doc.descriptor) resolveDescriptor(doc.descriptor, 'file');
  const descriptions = new Set();
  for (const t of doc.tests) {
    cases++;
    if (!t.id) problems.push(`${rel}: case "${t.description}" has no id`);
    else if (ids.has(t.id)) problems.push(`${rel}: id "${t.id}" is also in ${ids.get(t.id)}`);
    else ids.set(t.id, rel);
    if (descriptions.has(t.description)) problems.push(`${rel}: description "${t.description}" is used twice`);
    descriptions.add(t.description);
    if (t.descriptor) resolveDescriptor(t.descriptor, `case ${t.id}`);
    if (t.call) {
      let rawTx;
      try {
        rawTx = encodeCall(t.call);
      } catch (e) {
        problems.push(`${rel}: case ${t.id}: call does not encode: ${e.message}`);
        continue;
      }
      if (rawTx !== t.rawTx) {
        problems.push(`${rel}: case ${t.id}: rawTx does not match call (run: node tools/encode-call.mjs ${rel})`);
      }
    }
  }
}

console.log(`${files} file(s), ${cases} case(s), ${problems.length} problem(s)`);
for (const p of problems) console.log(`  ${p}`);
process.exit(problems.length === 0 ? 0 : 1);
