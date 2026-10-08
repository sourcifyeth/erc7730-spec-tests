#!/usr/bin/env node
// Runs one runner command over every test file of the suite and collects one results
// file per test file, named after the file's path with '/' replaced by '__', so that
// tools/build-report.mjs can join them back.
//
//   node tools/run-suite.mjs --out results/sourcify \
//     --cmd 'node ../clear-signing-test-runner/dist/cli.js {file} --output {out}'
//
// Placeholders in --cmd: {file} the test file, {out} the results file to write,
// {descriptors} the descriptors directory of the file's version folder.
// A runner that exits non-zero or writes no file does not stop the loop; the
// missing file is reported by build-report as an error on every case of that file.

import { readdirSync, statSync, mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { join, relative, resolve, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
};
const out = opt('--out');
const cmd = opt('--cmd');
if (!out || !cmd) {
  console.error("usage: node tools/run-suite.mjs --out <dir> --cmd '<command with {file} {out} {descriptors}>'");
  process.exit(2);
}
mkdirSync(out, { recursive: true });

function* walk(dir) {
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (name.endsWith('.tests.json')) yield p;
  }
}

let ran = 0;
let missing = 0;
for (const file of walk(join(root, 'tests'))) {
  const rel = relative(join(root, 'tests'), file);
  const key = rel.replace(/\//g, '__');
  const outFile = resolve(out, key);
  const descriptors = join(root, 'tests', rel.split('/')[0], 'descriptors');
  const command = cmd.replace('{file}', file).replace('{out}', outFile).replace('{descriptors}', descriptors);
  const r = spawnSync(command, { shell: true, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' });
  ran++;
  if (!existsSync(outFile)) {
    missing++;
    const why = `runner exited with status ${r.status}: ${(r.stderr || r.stdout || '').trim().split('\n').slice(-3).join(' | ').slice(0, 500)}`;
    writeFileSync(outFile + '.missing', why + '\n');
    console.log(`MISSING ${rel}: ${why}`);
  } else {
    console.log(`ok      ${rel}`);
  }
}
console.log(`${ran} file(s), ${missing} without results`);
