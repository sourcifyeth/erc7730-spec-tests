#!/usr/bin/env node
// Builds report.json and the badge files from the results of every implementation.
// See docs/report-format.md.
//
//   node tools/build-report.mjs --results <dir> --out <dir> \
//     [--run-id <id> --run-url <url>] [--suite-commit <sha>]
//
// <results dir> holds one directory per implementation id; each holds the files
// that tools/run-suite.mjs wrote (one per test file, '/' replaced by '__').

import { readFileSync, readdirSync, statSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, relative, resolve, dirname } from 'node:path';
import { execSync } from 'node:child_process';

const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
};
const resultsDir = opt('--results');
const outDir = opt('--out');
if (!resultsDir || !outDir) {
  console.error('usage: node tools/build-report.mjs --results <dir> --out <dir> [--run-id <id> --run-url <url>] [--suite-commit <sha>]');
  process.exit(2);
}
const runId = opt('--run-id');
const runUrl = opt('--run-url');
let suiteCommit = opt('--suite-commit');
if (!suiteCommit) {
  try {
    suiteCommit = execSync('git rev-parse HEAD', { cwd: root, encoding: 'utf8' }).trim();
  } catch {
    suiteCommit = null;
  }
}

const meta = JSON.parse(readFileSync(join(root, 'meta.json'), 'utf8'));

function* walk(dir) {
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (name.endsWith('.tests.json')) yield p;
  }
}

// One entry per implementation: its results keyed by file key.
const implementations = [];
const resultsByImpl = {};
for (const id of readdirSync(resultsDir).sort()) {
  const dir = join(resultsDir, id);
  if (!statSync(dir).isDirectory()) continue;
  const files = {};
  let runner = null;
  let implementation = null;
  let specVersions = null;
  for (const name of readdirSync(dir)) {
    if (name.endsWith('.tests.json')) {
      try {
        const r = JSON.parse(readFileSync(join(dir, name), 'utf8'));
        files[name] = r;
        runner = runner ?? r.runner ?? null;
        implementation = implementation ?? r.implementation ?? null;
        specVersions = specVersions ?? r.specVersions ?? null;
      } catch (e) {
        files[name] = { error: `results file is not JSON: ${e.message}` };
      }
    } else if (name.endsWith('.missing')) {
      files[name.replace(/\.missing$/, '')] = { error: readFileSync(join(dir, name), 'utf8').trim() };
    }
  }
  implementations.push({ id, runner, implementation, specVersions });
  resultsByImpl[id] = files;
}

const summary = {};
const bump = (impl, version, status) => {
  const s = ((summary[impl] ??= {})[version] ??= { pass: 0, fail: 0, error: 0, skipped: 0, total: 0 });
  s[status] = (s[status] ?? 0) + 1;
  s.total++;
};

const files = [];
for (const file of walk(join(root, 'tests'))) {
  const rel = relative(root, file);
  const key = relative(join(root, 'tests'), file).replace(/\//g, '__');
  const doc = JSON.parse(readFileSync(file, 'utf8'));
  const [specVersion, group] = relative(join(root, 'tests'), file).split('/');
  const cases = doc.tests.map((t) => {
    const { rawTx, ...rest } = t;
    const results = {};
    for (const impl of implementations) {
      const r = resultsByImpl[impl.id][key];
      let entry;
      if (!r) entry = { status: 'error', message: 'no results file for this test file' };
      else if (r.error) entry = { status: 'error', message: r.error };
      else {
        const found = (r.cases ?? []).find((c) => (c.id && c.id === t.id) || (!c.id && c.description === t.description));
        entry = found
          ? { status: found.status, rendered: found.rendered, message: found.message, warnings: found.warnings, durationMs: found.durationMs }
          : { status: 'error', message: 'runner wrote no entry for this case' };
      }
      for (const k of Object.keys(entry)) if (entry[k] === undefined) delete entry[k];
      results[impl.id] = entry;
      bump(impl.id, specVersion, entry.status);
    }
    return { ...rest, results };
  });
  files.push({
    path: rel,
    specVersion,
    group,
    kind: doc.kind ?? 'rendering',
    descriptor: doc.descriptor ? relative(root, resolve(dirname(file), doc.descriptor)) : null,
    comment: doc.$comment ?? null,
    dataProvider: doc.dataProvider ?? null,
    cases,
  });
}

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  suite: { repository: 'sourcifyeth/erc7730-spec-tests', commit: suiteCommit, version: meta.suiteVersion },
  run: runId ? { id: Number(runId), url: runUrl ?? null } : null,
  specVersions: meta.versions,
  implementations,
  summary,
  files,
};

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'latest.json'), JSON.stringify(report, null, 2) + '\n');
if (runId) {
  mkdirSync(join(outDir, 'runs'), { recursive: true });
  writeFileSync(join(outDir, 'runs', `${runId}.json`), JSON.stringify(report, null, 2) + '\n');
}

// index.json: newest first, deduplicated by run id.
const indexPath = join(outDir, 'index.json');
const index = existsSync(indexPath) ? JSON.parse(readFileSync(indexPath, 'utf8')) : { runs: [] };
if (runId) {
  index.runs = [{ id: Number(runId), url: runUrl ?? null, generatedAt: report.generatedAt, suiteCommit }, ...index.runs.filter((r) => r.id !== Number(runId))];
  writeFileSync(indexPath, JSON.stringify(index, null, 2) + '\n');
}

// Badges, shields.io endpoint format. Skips count as not passing.
const color = (pct) => (pct >= 100 ? '2ea043' : pct >= 90 ? '7cb342' : pct >= 70 ? 'dbab09' : 'cf222e');
for (const impl of implementations) {
  const dir = join(outDir, 'badges', impl.id);
  mkdirSync(dir, { recursive: true });
  const full = [];
  for (const [version, s] of Object.entries(summary[impl.id] ?? {})) {
    const pct = s.total === 0 ? 0 : Math.floor((100 * s.pass) / s.total);
    if (pct === 100) full.push(version);
    writeFileSync(join(dir, `${version}.json`), JSON.stringify({ schemaVersion: 1, label: `ERC-7730 ${version}`, message: `${pct}% passing`, color: color(pct) }) + '\n');
  }
  writeFileSync(join(dir, 'versions.json'), JSON.stringify({ schemaVersion: 1, label: 'ERC-7730 versions', message: full.length ? full.join(', ') : 'none', color: full.length ? '2ea043' : 'cf222e' }) + '\n');
}

for (const impl of implementations) {
  const rows = Object.entries(summary[impl.id] ?? {}).map(([v, s]) => `${v}: ${s.pass}/${s.total} pass, ${s.fail} fail, ${s.error} error, ${s.skipped} skipped`);
  console.log(`${impl.id} (${impl.implementation ?? 'unknown'})\n  ${rows.join('\n  ')}`);
}
console.log(`wrote ${join(outDir, 'latest.json')}`);
