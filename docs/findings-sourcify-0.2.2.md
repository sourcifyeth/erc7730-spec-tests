# Findings: `@ethereum-sourcify/clear-signing@0.2.2` on 2026-10-08

Runner: `sourcifyeth/clear-signing-test-runner` at `dae3cda`. Suite: every file under `tests/`, 110 cases. Result: 73 pass, 27 fail, 1 file the runner cannot read (`validation/descriptors.tests.json`, `kind: validation`, which predates the runner).

A fail is one of four things. **Runner extension**: the library behaved as the spec requires, but the runner has no way to report it. **Implementation gap**: the library does not implement the behaviour. **Implementation bug**: the library implements it and gets it wrong. **Spec unclear**: the case reads the text one way and the library another. No case was changed to match the library.

| Case | Rendered | Verdict |
|---|---|---|
| `context/deployments/unlisted-chain-no-match` | empty, warning `NO_DESCRIPTOR` | runner extension: report `{match: false}` |
| `context/deployments/unlisted-address-no-match` | empty, warning `NO_DESCRIPTOR` | runner extension |
| `context/selector/unknown-selector-no-match` | empty, warning `NO_FORMAT_MATCH` | runner extension |
| `includes/context-from-including-file-binds-included-formats` | empty, warning `NO_DESCRIPTOR` | runner extension |
| `display/visible/mustMatch-mismatch-is-an-error` | empty, warning `MUSTMATCH_VIOLATION` | runner extension |
| `context/eip712/different-field-order-no-match` | empty, warning `NO_DESCRIPTOR` | runner extension |
| `context/eip712/domain-name-mismatch-no-match` | empty, warning `DOMAIN_MISMATCH` | runner extension |
| `context/eip712/deployment-chain-mismatch-no-match` | empty, warning `NO_DESCRIPTOR` | runner extension |
| `context/eip712/deployment-missing-verifying-contract-no-match` | empty, warning `UNSUPPORTED_DOMAIN` | runner extension; the library refuses for a narrower reason than the spec gives, same outcome |
| `context/eip712/domain-separator-matches` | empty, warning `NO_DESCRIPTOR` | runner extension + implementation gap: the runner indexes descriptors by `deployments` only, so a `domainSeparator`-only binding is never found |
| `context/eip712/domain-separator-mismatch-no-match` | empty, warning `NO_DESCRIPTOR` | same; passes by accident once the runner indexes by `domainSeparator` |
| `formats/calldata/calleePath-nested-descriptor` | raw hex of the inner call | runner extension: the runner builds its index from the one descriptor of the test file, so the inner descriptor (`descriptors/inner-token.json`) is unknown. The registry's Safe tests show the library renders nested calls once the descriptor is indexed |
| `formats/calldata/amountPath-non-zero` | raw hex | runner extension, same |
| `formats/calldata/callee-constant` | raw hex | runner extension, same |
| `formats/calldata/selector-constant` | raw hex | runner extension, same; also spec issue 6 (arguments with or without selector) |
| `formats/raw/string-non-ascii` | `ÃnÃ¯code â æ¥æ¬` | implementation bug: UTF-8 bytes decoded as Latin-1 |
| `paths/array/slices` | empty, warning `INVALID_DESCRIPTOR: No value found for field 'values.[1:3]'` | implementation gap: array slices `[a:b]` not supported; `[0]`, `[-1]`, `[]` and bytes slices work |
| `display/intent/object-form` | `"Native Staking: Withdraw, Rewards: Consensus & Exec"` | runner extension: the runner flattens an object intent to one string; the suite expects the object. To confirm with implementers whether the results contract should carry the object |
| `display/interpolatedIntent/unresolvable-placeholder-falls-back` | error `INTERPOLATION_ERROR: Missing interpolated value for 'missing'` | implementation bug: the spec says the wallet MUST fall back to `intent`; the library fails the whole render |
| `metadata/token/contract-is-the-token` | `2500000` | implementation gap: `metadata.token` is not used as the token metadata of the contract |
| `formats/tokenTicker/chainIdPath` | `TKN` | implementation gap: `chainIdPath` ignored. Also runner extension: the chain-scoped `eip155:<chainId>:<address>` data-provider key is a suite addition |
| `formats/tokenAmount/chainIdPath` | `3000000000000 TKN` | implementation gap, same |
| `formats/tokenAmount/chainId-constant` | `3000000000000 TKN` | implementation gap, same |
| `formats/interoperableAddressName/spec-example` | the raw bytes | implementation gap: ERC-7930 format not implemented |
| `formats/amount/threshold/equal-renders-default-message` (2.1.0) | the amount | implementation gap: 2.1.0 not implemented |
| `formats/amount/threshold/above-renders-custom-message` (2.1.0) | the amount | implementation gap: 2.1.0 |
| `formats/amount/threshold/equal-renders-custom-message` (2.1.0) | the amount | implementation gap: 2.1.0 |

## What the runner needs

1. Report `{ "match": false }` as `rendered` when the library refuses the descriptor (`NO_DESCRIPTOR`, `NO_FORMAT_MATCH`, `DOMAIN_MISMATCH`, `MUSTMATCH_VIOLATION`, `UNSUPPORTED_DOMAIN`), and compare it with `expected.match`.
2. Load every descriptor under `tests/<version>/descriptors/` into the index, not only the one the test file names, so that embedded calls resolve.
3. Index EIP-712 descriptors by `domainSeparator` as well as by `deployments`.
4. Read `kind: validation` files: load the descriptor, report `valid: true|false`.
5. Honour chain-scoped `dataProvider.tokens` keys (`eip155:<chainId>:<address>`) and `dataProvider.chainNames`.
6. Keep an object `intent` as an object in `rendered`, or agree with the suite on a flattened form.

## What the library needs

1. Decode `string` arguments as UTF-8.
2. Array slices `[a:b]`, `[:b]`, `[a:]`.
3. Fall back to `intent` when an `interpolatedIntent` placeholder cannot be resolved.
4. Use `metadata.token` for the contract's own token metadata.
5. `chainId` / `chainIdPath` on `tokenAmount` and `tokenTicker`.
6. `interoperableAddressName`.
7. `amount` `threshold` / `message` (2.1.0).
