# Feature matrix

Every behaviour the ERC-7730 text requires, and the cases that cover it. One row per behaviour. The `Cases` column lists case ids that exist; `Planned` is the number still to write. `Registry` is how many of the 1,000-odd registry descriptors use the feature as of 2026-10-08: a zero there means no implementation has been exercised on it by registry tests, so the suite is the only coverage.

The spec text used is the ERC at commit `2528d6a` for 2.0.0 and `master` (2026-10-08) for 2.1.0. Section names are the headings of `ERCS/erc-7730.md`.

Status key: **done** = cases exist and pass `npm run check`; **planned** = not written; **open** = blocked on a rendering convention (see [`rendering-conventions.md`](rendering-conventions.md)); **spec issue** = the text and the schema disagree, so the behaviour cannot be required until the spec is fixed.

## 2.1.0

| Behaviour | Spec section | Cases | Planned | Status |
|---|---|---|---|---|
| `amount` with `threshold`: value ≥ threshold shows `message`, default `All` | Field formats > amount | `formats/amount/threshold/*` (5) | 0 | done |

## 2.0.0

### Field formats

| Behaviour | Spec section | Cases | Planned | Registry | Status |
|---|---|---|---|---|---|
| `raw` on uint/int: decimal | Field formats > Integer formats > raw | | 3 (small, large uint256, negative int) | 853 | planned |
| `raw` on address: ERC-55 | Field formats > Address > raw | | 2 (lower-case input, all-caps input) | | planned |
| `raw` on bytes, bytesN: hex | Field formats > Bytes formats > raw | | 3 (bytes, bytes32, empty bytes) | | open: `0x` prefix |
| `raw` on string: UTF-8 | Field formats > String formats > raw | | 2 (ASCII, non-ASCII) | | planned |
| `raw` on bool | not in spec | | 1 | | optional |
| `amount`: native value and uint argument | Field formats > amount | | 4 (`@.value`, argument, zero, 1 wei) | 91 | planned |
| `tokenAmount`: decimals, trailing zeros, zero, smallest unit | Field formats > tokenAmount | `formats/tokenAmount/token-path-container`, `fractional`, `smallest-unit`, `zero`, `zero-decimals`, `token-path-argument` | 0 | 311 | done |
| `tokenAmount` `threshold` ≥ with default `Unlimited` and custom `message` | Field formats > tokenAmount | `formats/tokenAmount/threshold/*` (4) | 0 | | done |
| `tokenAmount` `token` constant | Field formats > tokenAmount | `formats/tokenAmount/token-constant` | 0 | | done |
| `tokenAmount` `nativeCurrencyAddress` string, list, constant path, no match | Field formats > tokenAmount | `formats/tokenAmount/native-currency-address-*` (3) | 1 (plain string) | 21 | done |
| `tokenAmount` `chainId` / `chainIdPath` | Field formats > tokenAmount | | 3 (constant, path, same address other chain) | 0 | planned |
| `tokenAmount` token unknown → raw value + warning | Field formats > tokenAmount | | 1 | | optional (SHOULD) |
| `tokenAmount` via `metadata.token` of the contract | Metadata section > token | | 2 | | planned |
| `tokenTicker` | Field formats > Address > tokenTicker | | 2 (known, `chainId`) | 0 | planned |
| `nftName` `collection` / `collectionPath`, unknown id fallback | Field formats > nftName | | 3 | 87 | open: form |
| `date` `timestamp`, `blockheight` | Field formats > date | | 4 | 107 (blockheight 0) | open: form |
| `duration` | Field formats > duration | | 4 (spec example, 0, > 99 h, 1 s) | 19 | planned |
| `unit` `base`, `decimals`, `prefix` | Field formats > unit | | 6 (spec's three examples, decimals 0, `%`, `bps`) | 71 | planned, form fixed to spec |
| `enum` via `$.metadata.enums` | Field formats > enum; Metadata > enums | | 3 (mapped, numeric key as string, bool key) | 55 | planned |
| `enum` value not in the enum | not in spec | | 1 | | open |
| `chainId` → chain name | Field formats > chainId | | 2 | 0 | planned |
| `addressName` no source → ERC-55 | Field formats > addressName | | 1 | 718 | planned |
| `addressName` local name, ENS name | Address types and sources | | 2 | 58 (`sources`) | planned |
| `addressName` `sources` restricts lookup | Address types and sources | | 2 (ens-only hides local, local-only hides ens) | | planned |
| `addressName` `types` | Address types and sources | | 1 | 301 | optional (SHOULD check) |
| `addressName` `senderAddress` → `Sender` | Field formats > addressName | | 2 (string, list) | 6 | planned |
| `interoperableAddressName` | Field formats > Interoperable addresses | | 2 (spec example, with `sources`) | 0 | planned |
| `calldata` `calleePath`, nested descriptor found | Embedded Calldata; Field formats > calldata | | 3 | 20 | planned |
| `calldata` `callee`, `selector`/`selectorPath`, `amountPath` → `@.value`, `spenderPath` → `@.from` | Field formats > calldata | | 5 | 0–6 | planned |
| `calldata` `chainIdPath` | Field formats > calldata | | | 0 | spec issue: in the text, not in the 2.0.0 schema |
| `calldata` no descriptor found | Field formats > calldata | | 1 | | open (MAY) |
| `encryption` `fallbackLabel` when decryption unavailable | Field format specification > encryption | | 2 | 1 | planned (SHOULD; `optional/`) |

### Paths

| Behaviour | Spec section | Cases | Planned | Registry | Status |
|---|---|---|---|---|---|
| relative path = `#.` path | Path references | | 2 | | planned |
| nested tuple `a.b.c` | Path references | | 2 | | planned |
| array index `arr.[0]`, negative `arr.[-1]` | Path references > Path slices | | 3 | | planned |
| all elements `arr.[]` → one field per element, same label | Slices in paths | | 2 | | planned |
| array slice `arr.[1:3]`, `[:2]`, `[-2:]` | Slices in paths | | 4 | | planned |
| bytes slice `data.[0:20]` as tokenPath | Slices in paths | | 2 | | planned |
| bytes slice as the formatted value | Slices in paths | | 2 | | planned |
| `@.from`, `@.value`, `@.to`, `@.chainId` on a transaction | Container structure values > EVM Transaction container | | 4 | | planned |
| `@.from`, `@.to`, `@.chainId` on an EIP-712 message; `@.value` = 0 | Container structure values > EIP-712 container | | 3 | | planned (`@.value` MAY → optional) |
| `$.metadata.constants.X` as a parameter | Metadata section > constants | | 2 | | planned |
| literal `value` instead of `path` | Field format specification > path / value | | 2 | 7 | planned |
| path form `recipients[0]` (bracket without dot) as the spec's minimal example writes it | Display section > Decoding and parameter names | | | | spec issue: contradicts "Paths MUST use the dot notation" |

### Context and matching

| Behaviour | Spec section | Cases | Planned | Registry | Status |
|---|---|---|---|---|---|
| deployment match on chain + address; mismatch on either → no match | Context section > contract.deployments | | 4 | | planned |
| several deployments | Context section > contract.deployments | | 1 | | planned |
| `factory` constraint | Context section > contract.factory | | | 1 | planned (`optional/`: needs event data the fixture cannot carry yet) |
| selector match after stripping parameter names | Display section > Selector matching | | 2 | | planned |
| unknown selector → no match | Display section > Unknown selectors | | 1 | | planned |
| overloaded functions pick by type signature | Display section > Contract keys | | 2 | | planned |
| duplicate type-only signature → invalid descriptor | Display section > Selector matching | | 1 | | planned (validation) |
| canonical type names: `uint` alias, spaces after commas → invalid key | Display section > Contract keys | | 2 | | planned (validation) |
| tuple and array types in keys | Display section > Contract keys | | 3 | | planned |
| EIP-712 key = `encodeType`, type hash must match | Display section > EIP-712 keys | | 2 (match, different field order → no match) | | planned |
| `eip712.domain` key-value binding; extra keys in message allowed | Context section > eip712.domain | | 3 | | planned |
| `eip712.deployments` needs `chainId` + `verifyingContract` | Context section > eip712.deployments | | 3 | | planned |
| `eip712.domainSeparator` | Context section > eip712.domainSeparator | | 2 | 0 | planned |
| proxy pointing at a deployment | Security Considerations > Proxy support | | | | optional: needs chain state |

### Display

| Behaviour | Spec section | Cases | Planned | Registry | Status |
|---|---|---|---|---|---|
| `intent` string; `intent` object | Structured data format specification > intent | | 2 | | planned |
| `interpolatedIntent` with field, container and constant placeholders | Value interpolation | | 3 | 62 | planned |
| `interpolatedIntent` escaping `{{` `}}` | Value interpolation > Escaping | | 1 | | planned |
| `interpolatedIntent` with an unresolvable placeholder → fall back to `intent` | Value interpolation > Formatting behavior | | 1 | | planned |
| `interpolatedIntent` placeholder on a `visible: never` field | Value interpolation | | 1 | | planned (validation) |
| `display.definitions` + `$ref`, params override | Display section > definitions; fields | | 3 | 12 | planned |
| group with `path` prefixes child paths | Group format specification | | 2 | | planned |
| group `iteration: sequential` and `bundled` | Group format specification > iteration | | 2 | 0 | planned |
| `bundled` with arrays of different sizes → error | Group format specification | | 1 | | planned (SHOULD → optional) |
| field order follows descriptor order | Group format specification | | 1 | | planned |
| `visible: never`, `always` | Field format specification > visible | | 2 | 145 | planned |
| `visible: optional` | Field format specification > visible | | 1 | | optional (MAY) |
| `visible: { ifNotIn }` | Field format specification > visible | | 2 | 3 | planned |
| `visible: { mustMatch }` hides; mismatch → error | Field format specification > visible | | 2 | 0 | planned |
| `separator` with `{index}` | Field format specification > separator | | | 0 | open: no place in the results shape |
| array parameters: `tokenPath: tokens.[]` paired by index | Field format specification > Array references in parameters | | 2 | | planned |
| `$id` keys are ignored | Common concepts > Key naming convention | | 1 | | planned |
| `required` / `excluded` keys in the embedded-calldata example | Embedded Calldata | | | 0 | spec issue: not in any schema |
| `number`, `bytes32` formats in the minimal examples | Display section > Minimal contract examples | | | | spec issue: not format names |

### Metadata

| Behaviour | Spec section | Cases | Planned | Registry | Status |
|---|---|---|---|---|---|
| `owner` shown; absent owner | Metadata section > owner | | 2 | | planned |
| `constants` | Metadata section > constants | | (covered under Paths) | | |
| `enums` | Metadata section > enums | | (covered under formats) | 33 | |
| `maps` with `keyPath: @.chainId`; missing key → invalid for this transaction | Metadata section > maps | | 3 | 0 | spec issue: `metadata.maps` is in the text but not in the 2.0.0 schema's metadata object |
| `token` metadata used when the contract is the token | Metadata section > token | | (covered under formats) | | |

### Includes

| Behaviour | Spec section | Cases | Planned | Registry | Status |
|---|---|---|---|---|---|
| including file wins on a common key | Organizing files | | 2 | 220 | planned |
| `fields` merged by `path`, params overridden | Organizing files > Merging field format specifications | | 2 | | planned |
| new paths appended after the included ones | Organizing files > Merging field format specifications | | 1 | | planned |
| `context.contract` keys merged | Organizing files | | 1 | | planned |
| include that is itself an including file | Organizing files | | 1 | | planned |
| unresolvable include → invalid | Organizing files | | 1 | | planned (validation) |

### Versioning

| Behaviour | Spec section | Cases | Planned | Registry | Status |
|---|---|---|---|---|---|
| `$schema` with a MAJOR the wallet does not implement → invalid | Versioning | | 2 (major 1 if deprecated, major 3) | | planned (validation) |
| `$schema` with a newer MINOR on an implemented MAJOR → processed | Versioning | | 1 | | planned |
| `$schema` alias file vs exact-version file both accepted | Versioning > Schema files and the `$schema` key | | 2 | | planned |

## Totals

| | Done | Planned | Open | Optional | Spec issue |
|---|---|---|---|---|---|
| 2.1.0 | 5 | 0 | 0 | 0 | 0 |
| 2.0.0 | 14 | ≈150 | 5 | 8 | 5 |

## Spec issues to file

1. `metadata.maps` is described in the text (with two example files in the assets) but the 2.0.0 and 2.1.0 schemas do not list `maps` under `metadata`; the `$metadata/maps` definition exists and nothing references it. A descriptor with maps fails schema validation.
2. The `calldata` parameter table lists `chainIdPath` / `chainId`; `calldataParameters` in the schema has neither.
3. The embedded-calldata examples use `required` and `excluded` keys on a format; no schema defines them.
4. The minimal contract examples use `"format": "number"` and `"format": "bytes32"`, which are not format names, and `recipients[0]` without the dot that the path rules require.
5. The `date` table shows `2024-02-29T08:27:12` while every deployed implementation renders `2026-03-19 12:11:19Z`; the `nftName` table shows a two-line form that no implementation produces. The spec should either fix the form or say that the form is wallet-specific, in which case the suite compares a structured value instead of the string.
