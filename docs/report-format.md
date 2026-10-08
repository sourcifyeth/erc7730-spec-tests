# Report format

A report is one JSON file that holds the result of one run of the whole suite against every known implementation. The nightly workflow ([`conformance.yml`](../.github/workflows/conformance.yml)) builds it with [`tools/build-report.mjs`](../tools/build-report.mjs) and commits it to the `reports` branch of this repository. The viewer reads it from `raw.githubusercontent.com`.

The report is the contract between this repository and the viewer, which lives in its own repository. `schemaVersion` names the version of this document. The number goes up only for a change that breaks an old reader: a renamed or removed key, or a changed shape. A new optional key does not bump it.

## Files on the `reports` branch

| Path | Content |
|---|---|
| `latest.json` | The newest report |
| `runs/<run id>.json` | One report per run, kept forever |
| `index.json` | `{ "runs": [ { "id", "url", "generatedAt", "suiteCommit" } ] }`, newest first |
| `badges/<implementation id>/<spec version>.json` | A [shields.io endpoint](https://shields.io/badges/endpoint-badge) badge: `{ "schemaVersion": 1, "label": "ERC-7730 2.1.0", "message": "40% passing", "color": "..." }` |
| `badges/<implementation id>/versions.json` | The spec versions the implementation passes in full, e.g. `"message": "2.0.0"` |

## Top level

| Key | Type | Notes |
|---|---|---|
| `schemaVersion` | number | `1` |
| `generatedAt` | string | ISO 8601 time of the build |
| `suite.repository` | string | `sourcifyeth/erc7730-spec-tests` |
| `suite.commit` | string | The commit of the suite that was run |
| `suite.version` | string | `suiteVersion` from `meta.json` |
| `run` | object or null | `{ "id", "url" }` of the workflow run; null for a local build |
| `specVersions` | object | The `versions` map of `meta.json`, keyed by version folder name |
| `implementations` | array | One entry per implementation, sorted by `id` |
| `implementations[].id` | string | The results directory name, e.g. `sourcify`, `rust`. Keys the `results` map of every case |
| `implementations[].runner` | string or null | The `runner` field of the runner's results files |
| `implementations[].implementation` | string or null | The `implementation` field, `package@version` |
| `implementations[].specVersions` | array or null | The `specVersions` field, when the runner writes one |
| `summary` | object | `summary[<implementation id>][<spec version>]` = `{ "pass", "fail", "error", "skipped", "total" }`. A missing results file counts every case of the file as `error` |
| `files` | array | One entry per test file, in path order |

## `files[]`

| Key | Type | Notes |
|---|---|---|
| `path` | string | Repository path, e.g. `tests/2.0.0/formats/tokenAmount.tests.json` |
| `specVersion` | string | The version folder |
| `group` | string | The folder under the version, e.g. `formats`, `context`, `validation` |
| `kind` | `rendering` or `validation` | |
| `descriptor` | string or null | Repository path of the file-level descriptor |
| `comment` | string or null | The file's `$comment` |
| `dataProvider` | object or null | The file's `dataProvider` block |
| `cases` | array | One entry per case, in file order |

### `cases[]`

The case as written in the test file (`id`, `description`, `spec`, `until`, `call`, `from`, `txHash`, `data`, `descriptor`, `expected`; `rawTx` is left out), plus:

| Key | Type | Notes |
|---|---|---|
| `results` | object | `results[<implementation id>]` = `{ "status", "rendered", "message", "warnings", "durationMs" }`, the entry of the runner's results file for this case, joined on `id`, or on `description` when the runner wrote no `id`. A case with no entry gets `{ "status": "error", "message": "<why>" }` |

Every string under `files` comes from this repository or from a runner. The viewer treats them as text and builds links only from values that match a strict pattern.
