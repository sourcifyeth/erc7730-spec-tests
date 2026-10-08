# Results format

A runner reads one test file, renders every case with the implementation under test, and writes one `results.json`. This is the same contract the registry uses for its per-descriptor tests; the canonical text lives in the registry at [`.github/test-runner-docs/README.md`](https://github.com/ethereum/clear-signing-erc7730-registry/blob/master/.github/test-runner-docs/README.md). This page repeats what matters for the suite and lists the two additions the suite needs.

## What the runner must do

- Resolve `includes` itself.
- Use the file's `dataProvider` block for token metadata, names, NFT collection names, block timestamps and chain names. Never the network.
- Render every case, whatever the outcome, and write one entry per case.
- Exit 0 when every case produced an entry. Exit non-zero only when the runner itself could not read the input or write the output.

## The file

```json
{
  "runner": "@ethereum-sourcify/clear-signing-test-runner",
  "implementation": "@ethereum-sourcify/clear-signing@0.3.0",
  "specVersions": ["2.0.0", "2.1.0"],
  "cases": [
    {
      "id": "formats/tokenAmount/threshold-equal",
      "description": "value equal to threshold renders the message",
      "status": "pass",
      "rendered": {
        "intent": "Approve",
        "owner": "Spec Tests",
        "fields": [
          { "label": "Spender", "value": "0x1111111111111111111111111111111111111111" },
          { "label": "Amount", "value": "Unlimited DAI" }
        ]
      }
    }
  ]
}
```

| Key | Required | Notes |
|---|---|---|
| `runner` | yes | Identifier of the runner program |
| `implementation` | yes | The implementation under test, `package@version` |
| `specVersions` | suite addition | The spec versions the implementation claims. The report uses it to decide which folders count. |
| `cases[].id` | suite addition | Copied from the case. Registry fixtures have no id; there `description` is the key. |
| `cases[].description` | yes | Copied verbatim |
| `cases[].status` | yes | `pass`, `fail`, `error` or `skipped` |
| `cases[].rendered` | on pass and fail | Same shape as `expected`. For a no-match case, `{ "match": false }` |
| `cases[].message` | on error and skipped | Why. On a skip, say what is not supported and link an issue when there is one |
| `cases[].warnings` | optional | Notes that did not change the verdict |
| `cases[].durationMs` | optional | |

## Status values

- `pass`: `rendered` equals `expected`. For a case with `expected.match: false`, pass means the implementation refused to apply the descriptor. For a validation case, pass means the implementation accepted or rejected the descriptor as `expected.valid` says; the error category is informative, not compared.
- `fail`: the runner ran and the result differs.
- `error`: the runner crashed or timed out on this case. Not a verdict on the implementation's semantics.
- `skipped`: the runner chose not to run the case. Always with a message. A skip counts as not passing in every report, but the report shows the reason.

## Comparison rules

Compared as JSON values after one normalisation: `fields[].value` strings are compared exactly, with no trimming and no case folding. [`rendering-conventions.md`](rendering-conventions.md) fixes the string form so that exact comparison is fair.
