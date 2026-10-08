# ERC-7730 spec tests

A conformance test suite for implementations of [ERC-7730](https://github.com/ethereum/ERCs/blob/master/ERCS/erc-7730.md), the clear-signing descriptor format. The suite is data only: JSON files that pair a descriptor and a transaction (or EIP-712 message) with the output that the specification requires. An implementation runs the files with its own runner and reports which cases pass.

The suite is versioned with the specification. Each released version of the ERC-7730 schema has its own folder. An implementation that claims to support version `2.1.0` runs the `2.0.0` folder and the `2.1.0` folder. A folder for a released version does not change after it is tagged, except to fix a case that is wrong against the specification text.

## Status

Early. The format is settled enough to write cases against; the `2.0.0` folder is being filled. See [`docs/feature-matrix.md`](docs/feature-matrix.md) for what exists and what is planned.

## Layout

```
meta.json                      which spec commit and schema file each version folder targets
schema/erc7730-tests.schema.json   the fixture format (a superset of the registry's .tests.json format)
docs/
  feature-matrix.md            every spec feature, with the cases that cover it
  rendering-conventions.md     the exact string form the suite expects per format
  results-format.md            what a runner writes, and the status values
tests/
  2.0.0/                       cases for spec version 2.0.0
    descriptors/               the minimal descriptors the cases point at
    formats/                   one file per field format
    paths/                     path roots, array selectors, slices
    context/                   deployment, domain, selector and type-hash matching
    display/                   intent, interpolatedIntent, definitions, groups, visibility
    metadata/                  constants, enums, maps, token
    includes/                  file merging
    validation/                descriptors an implementation must reject
    optional/                  behaviour the spec marks MAY or SHOULD
  2.1.0/                       only what 2.1.0 adds over 2.0.0
  next/                        tracks the 3.0.0-next draft; advisory, changes without notice
tools/
  encode-call.mjs              builds the rawTx of a case from its call block
  check.mjs                    validates every test file (schema, unique ids, rawTx matches call)
```

## The fixture format

A test file is the registry's `.tests.json` format with a few additions. The registry format is documented in the [registry README](https://github.com/ethereum/clear-signing-erc7730-registry#test-files); every registry test file is a valid file of this suite. The additions are:

| Key | Where | Purpose |
|---|---|---|
| `specVersion` | file | The spec version the file belongs to. Equal to the folder name. |
| `id` | case | A stable identifier, unique across the suite. Runners and reports key on it. Never renamed. |
| `spec` | case | `{ "section": "...", "quote": "..." }`: the heading of the spec section that requires this behaviour, and the sentence that states it. |
| `call` | calldata case | The decoded transaction: chain, target, value, function signature and arguments. `rawTx` is built from it by `tools/encode-call.mjs`, and `tools/check.mjs` fails when the two disagree. |
| `expected.match: false` | rendering case | The descriptor must not be applied to this input (wrong chain, address, selector, domain or type hash). |
| `kind: "validation"` | file | A file of descriptors that an implementation must accept or reject, with an error category. |

The schema is in [`schema/erc7730-tests.schema.json`](schema/erc7730-tests.schema.json).

A rendering case:

```json
{
  "id": "formats/tokenAmount/threshold-equal",
  "description": "value equal to threshold renders the message",
  "spec": {
    "section": "Field formats > tokenAmount",
    "quote": "If the field value is greater than or equal to it, the wallet displays message instead of the amount."
  },
  "call": {
    "chainId": 1,
    "to": "0x0000000000000000000000000000000000007730",
    "function": "approve(address spender,uint256 value)",
    "args": ["0x1111111111111111111111111111111111111111", "0xffffffff"]
  },
  "rawTx": "0x02...",
  "expected": {
    "intent": "Approve",
    "owner": "Spec Tests",
    "fields": [
      { "label": "Spender", "value": "0x1111111111111111111111111111111111111111" },
      { "label": "Amount", "value": "Unlimited DAI" }
    ]
  }
}
```

Expected values are the strings a wallet shows. [`docs/rendering-conventions.md`](docs/rendering-conventions.md) fixes the exact form per format, because the spec text leaves some of them open. A case never depends on the network: token metadata, names and block times come from the file's `dataProvider` block.

## Running the suite

The suite has no runner. An implementation writes one. The runner reads a test file, renders every case, and writes a `results.json` as described in [`docs/results-format.md`](docs/results-format.md). Two runners exist today and already read this format:

- [`sourcifyeth/clear-signing-test-runner`](https://github.com/sourcifyeth/clear-signing-test-runner) for `@ethereum-sourcify/clear-signing` (TypeScript)
- `cs-test` in [`llbartekll/clear-signing`](https://github.com/llbartekll/clear-signing) (Rust)

Run one file:

```sh
node dist/cli.js tests/2.1.0/formats/amount-threshold.tests.json --output results.json
```

A runner reports one of four statuses per case: `pass`, `fail`, `error`, `skipped`. A skip must carry a message that says why. Skips count as not passing, but the report shows the reason, so "we do not support `calldata` yet" reads differently from a wrong result.

## The conformance report

A workflow ([`conformance.yml`](.github/workflows/conformance.yml)) runs every known implementation over the whole suite each night, on every push to `main` that touches the tests, and on request. It builds one `report.json` with [`tools/build-report.mjs`](tools/build-report.mjs) and commits it to the `reports` branch, with one badge file per implementation and spec version. The format is in [`docs/report-format.md`](docs/report-format.md). The viewer that shows the report lives in [`sourcifyeth/erc7730-spec-tests-report`](https://github.com/sourcifyeth/erc7730-spec-tests-report).

To add an implementation, add a job to the workflow that builds its runner and calls `tools/run-suite.mjs` with the runner's command line. The job's artifact name, `results-<id>`, becomes the implementation id in the report.

To build a report locally:

```sh
node tools/run-suite.mjs --out results/sourcify --cmd 'node ../clear-signing-test-runner/dist/cli.js {file} --output {out}'
node tools/build-report.mjs --results results --out report
```

## Versioning and releases

- A folder is named after the spec version it covers, as the `version` key of the schema file names it. `meta.json` records the commit of the ERC text each folder was written against.
- A new spec version gets a new folder that holds only what the version adds or changes. Cases from older folders stay valid and keep running.
- When a version changes the behaviour of an older case, the older case gets `"until": "<version>"` and the new folder holds the replacement. This has not happened yet.
- The `next/` folder tracks the `-next` draft schema. It is advisory. Its cases move into a version folder when that version is released.
- A release of this suite is a git tag `v<suite version>` with a GitHub Release. Implementations pin a tag, not `main`.

## Contributing a case

1. Find the sentence in the spec that requires the behaviour. Put its section heading and the sentence in `spec`. If no sentence requires it, the case goes in `optional/`, or it is a spec issue first.
2. Write the smallest descriptor that shows the behaviour, under `tests/<version>/descriptors/`. One behaviour per descriptor.
3. Write `call` (or `data` for EIP-712) and the expected output by hand from the spec text and [`docs/rendering-conventions.md`](docs/rendering-conventions.md). Do not copy an implementation's output into `expected`.
4. Run `npm run encode -- <file>` to fill `rawTx`, then `npm run check`.
5. Run at least one implementation against the file. A disagreement is a finding: either the case is wrong, the implementation is wrong, or the spec is unclear. Say which in the pull request.

Review rule, taken from the JSON Schema test suite: a case is merged because a reviewer confirmed it against the specification text, not because an implementation passes it. A case that turns out to be wrong against the spec is removed or fixed at once.

## Related

- The descriptor registry, [`ethereum/clear-signing-erc7730-registry`](https://github.com/ethereum/clear-signing-erc7730-registry), holds per-descriptor tests in the same format. Those test descriptors; this suite tests implementations.
- Prior art this suite copies from: [`ethereum/execution-specs` tests](https://github.com/ethereum/execution-specs/tree/master/tests) (version tagging, release pinning, spec-commit references in fixtures) and the [JSON Schema Test Suite](https://github.com/json-schema-org/JSON-Schema-Test-Suite) with [Bowtie](https://bowtie.report) (data-only cases, one file per keyword, `optional/`, skip-with-reason reporting).

## License

CC0-1.0, like the ERC text.
