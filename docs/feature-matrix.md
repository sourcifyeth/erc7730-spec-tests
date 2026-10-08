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
| `raw` on uint/int: decimal | Field formats > Integer formats > raw | `formats/raw/uint-and-int`, `uint256-max` | 0 | 853 | done |
| `raw` on address: ERC-55 | Field formats > Address > raw | `formats/raw/address-checksum` | 0 | | done |
| `raw` on bytes, bytesN: hex | Field formats > Bytes formats > raw | | 3 (bytes, bytes32, empty bytes) | | open: `0x` prefix |
| `raw` on string: UTF-8 | Field formats > String formats > raw | `formats/raw/string-ascii`, `string-non-ascii` | 0 | | done |
| `raw` on bool | not in spec | | 1 | | optional |
| `amount`: native value and uint argument | Field formats > amount | `formats/amount/container-value-and-argument`, `zero-and-one-wei` | 0 | 91 | done |
| `tokenAmount`: decimals, trailing zeros, zero, smallest unit | Field formats > tokenAmount | `formats/tokenAmount/token-path-container`, `fractional`, `smallest-unit`, `zero`, `zero-decimals`, `token-path-argument` | 0 | 311 | done |
| `tokenAmount` `threshold` ≥ with default `Unlimited` and custom `message` | Field formats > tokenAmount | `formats/tokenAmount/threshold/*` (4) | 0 | | done |
| `tokenAmount` `token` constant | Field formats > tokenAmount | `formats/tokenAmount/token-constant` | 0 | | done |
| `tokenAmount` `nativeCurrencyAddress` string, list, constant path, no match | Field formats > tokenAmount | `formats/tokenAmount/native-currency-address-*` (3) | 1 (plain string) | 21 | done |
| `tokenAmount` `chainId` / `chainIdPath` | Field formats > tokenAmount | `formats/tokenAmount/chainIdPath`, `chainId-constant` | 0 | 0 | done |
| `tokenAmount` token unknown → raw value + warning | Field formats > tokenAmount | | 1 | | optional (SHOULD) |
| `tokenAmount` via `metadata.token` of the contract | Metadata section > token | `metadata/token/contract-is-the-token` | 0 | | done |
| `tokenTicker` | Field formats > Address > tokenTicker | `formats/tokenTicker/known-token`, `chainIdPath` | 0 | 0 | done |
| `nftName` `collection` / `collectionPath`, unknown id fallback | Field formats > nftName | | 3 | 87 | open: form |
| `date` `timestamp`, `blockheight` | Field formats > date | | 4 | 107 (blockheight 0) | open: form |
| `duration` | Field formats > duration | `formats/duration/spec-example`, `zero`, `more-than-99-hours` | 0 | 19 | done |
| `unit` `base`, `decimals`, `prefix` | Field formats > unit | `formats/unit/base-only`, `decimals`, `si-prefix`, `percent-decimals` | 0 | 71 | done |
| `enum` via `$.metadata.enums` | Field formats > enum; Metadata > enums | `formats/enum/mapped-value`, `first-key` | 0 | 55 | done |
| `enum` value not in the enum | not in spec | | 1 | | open |
| `chainId` → chain name | Field formats > chainId | `formats/chainId/chain-name`, `paths/container/transaction-values` | 0 | 0 | done |
| `addressName` no source → ERC-55 | Field formats > addressName | `formats/addressName/no-name-renders-checksum-address` | 0 | 718 | done |
| `addressName` local name, ENS name | Address types and sources | `formats/addressName/ens-name-any-source`, `local-name-any-source` | 0 | 58 (`sources`) | done |
| `addressName` `sources` restricts lookup | Address types and sources | `formats/addressName/sources-ens-only-ignores-local`, `sources-ens-only-uses-ens`, `sources-local-only-ignores-ens` | 0 | | done |
| `addressName` `types` | Address types and sources | | 1 | 301 | optional (SHOULD check) |
| `addressName` `senderAddress` → `Sender` | Field formats > addressName | `formats/addressName/sender-address-renders-sender`, `sender-address-other-value` | 0 | 6 | done |
| `interoperableAddressName` | Field formats > Interoperable addresses | `formats/interoperableAddressName/spec-example` | 1 (with `sources`) | 0 | done |
| `calldata` `calleePath`, nested descriptor found | Embedded Calldata; Field formats > calldata | `formats/calldata/calleePath-nested-descriptor` | 0 | 20 | done |
| `calldata` `callee`, `selector`, `amountPath` → `@.value`, `spenderPath` → `@.from` | Field formats > calldata | `formats/calldata/callee-constant`, `selector-constant`, `amountPath-non-zero`, `calleePath-nested-descriptor` | 1 (`selectorPath`) | 0–6 | done |
| `calldata` `chainIdPath` | Field formats > calldata | | | 0 | spec issue: in the text, not in the 2.0.0 schema |
| `calldata` no descriptor found | Field formats > calldata | | 1 | | open (MAY) |
| `encryption` `fallbackLabel` when decryption unavailable | Field format specification > encryption | | 2 | 1 | planned (SHOULD; `optional/`) |

### Paths

| Behaviour | Spec section | Cases | Planned | Registry | Status |
|---|---|---|---|---|---|
| relative path = `#.` path | Path references | `paths/roots/absolute-and-relative` | 0 | | done |
| nested tuple `a.b.c` | Path references | `paths/roots/absolute-and-relative`, `context/selector/tuple-and-array-key` | 0 | | done |
| array index `arr.[0]`, negative `arr.[-1]` | Path references > Path slices | `paths/array/index-and-negative-index` | 0 | | done |
| all elements `arr.[]` → one field per element, same label; empty array | Slices in paths | `paths/array/all-elements`, `empty-array-no-fields` | 0 | | done |
| array slice `arr.[1:3]`, `[:2]`, `[-2:]` | Slices in paths | `paths/array/slices` | 0 | | done |
| bytes slice `data.[0:20]` as tokenPath | Slices in paths | `paths/bytes/slice-as-token-path` | 0 | | done |
| bytes slice as the formatted value | Slices in paths | `paths/bytes/slice-as-value` | 0 | | done |
| `@.from`, `@.value`, `@.to`, `@.chainId` on a transaction | Container structure values > EVM Transaction container | `paths/container/transaction-values` | 0 | | done |
| `@.from`, `@.to`, `@.chainId` on an EIP-712 message; `@.value` = 0 | Container structure values > EIP-712 container | `context/eip712/flat-type-matches` (`@.to`) | 2 | | planned (`@.value` MAY → optional) |
| `$.metadata.constants.X` as a parameter | Metadata section > constants | `paths/constants/constant-as-parameter`, `formats/tokenAmount/native-currency-address-constant-path` | 0 | | done |
| literal `value` instead of `path` | Field format specification > path / value | `paths/value/literal-value` | 0 | 7 | done |
| path form `recipients[0]` (bracket without dot) as the spec's minimal example writes it | Display section > Decoding and parameter names | | | | spec issue: contradicts "Paths MUST use the dot notation" |

### Context and matching

| Behaviour | Spec section | Cases | Planned | Registry | Status |
|---|---|---|---|---|---|
| deployment match on chain + address; mismatch on either → no match | Context section > contract.deployments | `context/deployments/first-chain-matches`, `unlisted-chain-no-match`, `unlisted-address-no-match` | 0 | | done |
| several deployments | Context section > contract.deployments | `context/deployments/second-chain-matches` | 0 | | done |
| `factory` constraint | Context section > contract.factory | | | 1 | planned (`optional/`: needs event data the fixture cannot carry yet) |
| selector match after stripping parameter names | Display section > Selector matching | `context/deployments/first-chain-matches` | 0 | | done |
| unknown selector → no match | Display section > Unknown selectors | `context/selector/unknown-selector-no-match` | 0 | | done |
| overloaded functions pick by type signature | Display section > Contract keys | `context/selector/overload-by-type-signature` | 0 | | done |
| duplicate type-only signature → invalid descriptor | Display section > Selector matching | `validation/selector/duplicate-type-signature` | 0 | | done (validation) |
| canonical type names: `uint` alias, spaces after commas → invalid key | Display section > Contract keys | `validation/format-key/type-alias`, `space-after-comma` | 0 | | done (validation) |
| tuple and array types in keys | Display section > Contract keys | `context/selector/tuple-and-array-key` | 0 | | done |
| EIP-712 key = `encodeType`, type hash must match | Display section > EIP-712 keys | `context/eip712/flat-type-matches`, `nested-struct-matches`, `different-field-order-no-match` | 0 | | done |
| `eip712.domain` key-value binding; extra keys in message allowed | Context section > eip712.domain | `context/eip712/flat-type-matches`, `domain-name-mismatch-no-match` | 0 | | done |
| `eip712.deployments` needs `chainId` + `verifyingContract` | Context section > eip712.deployments | `context/eip712/deployment-chain-mismatch-no-match`, `deployment-missing-verifying-contract-no-match` | 0 | | done |
| `eip712.domainSeparator` | Context section > eip712.domainSeparator | `context/eip712/domain-separator-matches`, `domain-separator-mismatch-no-match` | 0 | 0 | done |
| proxy pointing at a deployment | Security Considerations > Proxy support | | | | optional: needs chain state |

### Display

| Behaviour | Spec section | Cases | Planned | Registry | Status |
|---|---|---|---|---|---|
| `intent` string; `intent` object | Structured data format specification > intent | every rendering case; `display/intent/object-form` | 0 | | done |
| `interpolatedIntent` with field, container and constant placeholders | Value interpolation | `display/interpolatedIntent/field-container-constant-placeholders` | 0 | 62 | done |
| `interpolatedIntent` escaping `{{` `}}` | Value interpolation > Escaping | `display/interpolatedIntent/escaped-braces` | 0 | | done |
| `interpolatedIntent` with an unresolvable placeholder → fall back to `intent` | Value interpolation > Formatting behavior | `display/interpolatedIntent/unresolvable-placeholder-falls-back` | 0 | | done |
| `interpolatedIntent` placeholder on a `visible: never` field | Value interpolation | | 1 | | planned (validation) |
| `display.definitions` + `$ref`, params override | Display section > definitions; fields | `display/definitions/ref-uses-definition`, `ref-params-override` | 0 | 12 | done |
| group with `path` prefixes child paths | Group format specification | `display/groups/path-prefix` | 0 | | done |
| group `iteration: sequential` and `bundled` | Group format specification > iteration | `display/groups/iteration-bundled`, `iteration-sequential` | 0 | 0 | done |
| `bundled` with arrays of different sizes → error | Group format specification | | 1 | | planned (SHOULD → optional) |
| field order follows descriptor order | Group format specification | `display/order/descriptor-order-not-argument-order` | 0 | | done |
| `visible: never`, `always` | Field format specification > visible | `display/visible/never-hidden-ifNotIn-shown-mustMatch-hidden` | 0 | 145 | done |
| `visible: optional` | Field format specification > visible | | 1 | | optional (MAY) |
| `visible: { ifNotIn }` | Field format specification > visible | `display/visible/never-hidden-ifNotIn-shown-mustMatch-hidden`, `ifNotIn-hides-listed-value` | 0 | 3 | done |
| `visible: { mustMatch }` hides; mismatch → error | Field format specification > visible | `display/visible/never-hidden-ifNotIn-shown-mustMatch-hidden`, `mustMatch-mismatch-is-an-error` | 0 | 0 | done |
| `separator` with `{index}` | Field format specification > separator | | | 0 | open: no place in the results shape |
| array parameters: `tokenPath: tokens.[]` paired by index | Field format specification > Array references in parameters | `display/params/array-parameter-paired-by-index` | 0 | | done |
| `$id` keys are ignored | Common concepts > Key naming convention | `display/id/internal-ids-ignored` | 0 | | done |
| `required` / `excluded` keys in the embedded-calldata example | Embedded Calldata | | | 0 | spec issue: not in any schema |
| `number`, `bytes32` formats in the minimal examples | Display section > Minimal contract examples | | | | spec issue: not format names |

### Metadata

| Behaviour | Spec section | Cases | Planned | Registry | Status |
|---|---|---|---|---|---|
| `owner` shown; absent owner | Metadata section > owner | every rendering case; `metadata/owner/absent` | 0 | | done |
| `constants` | Metadata section > constants | (covered under Paths) | | | done |
| `enums` | Metadata section > enums | (covered under formats) | | 33 | done |
| `maps` with `keyPath: @.chainId`; missing key → invalid for this transaction | Metadata section > maps | | 3 | 0 | spec issue: `metadata.maps` is in the text but not in the 2.0.0 schema's metadata object |
| `token` metadata used when the contract is the token | Metadata section > token | `metadata/token/contract-is-the-token` | 0 | | done |

### Includes

| Behaviour | Spec section | Cases | Planned | Registry | Status |
|---|---|---|---|---|---|
| including file wins on a common key | Organizing files | `includes/including-file-wins-and-fields-merge-by-path` | 0 | 220 | done |
| `fields` merged by `path`, params overridden | Organizing files > Merging field format specifications | `includes/including-file-wins-and-fields-merge-by-path`, `overridden-threshold-below` | 0 | | done |
| new paths appended after the included ones | Organizing files > Merging field format specifications | `includes/new-path-appended-after-included-fields` | 0 | | done |
| `context.contract` keys merged | Organizing files | `includes/context-from-including-file-binds-included-formats` | 0 | | done |
| include that is itself an including file | Organizing files | every `includes/*` case (two levels) | 0 | | done |
| unresolvable include → invalid | Organizing files | `validation/includes/missing-file` | 0 | | done (validation) |

### Versioning

| Behaviour | Spec section | Cases | Planned | Registry | Status |
|---|---|---|---|---|---|
| `$schema` with a MAJOR the wallet does not implement → invalid | Versioning | `validation/schema-version/major-not-implemented` | 1 (deprecated major 1) | | done (validation) |
| `$schema` with a newer MINOR on an implemented MAJOR → processed | Versioning | `validation/schema-version/newer-minor-is-processed` | 0 | | done |
| `$schema` alias file vs exact-version file both accepted | Versioning > Schema files and the `$schema` key | `validation/schema-version/alias-file-accepted`, `exact-file-accepted` | 0 | | done (validation) |

## Totals

| | Done | Planned | Open | Optional | Spec issue |
|---|---|---|---|---|---|
| 2.1.0 | 5 | 0 | 0 | 0 | 0 |
| 2.0.0 | 105 | 9 | 5 | 8 | 5 |

Planned 2.0.0 cases left: `nativeCurrencyAddress` plain string, `interoperableAddressName` with `sources`, `calldata` `selectorPath`, EIP-712 `@.from` and `@.chainId`, `visible: never` placeholder (validation), deprecated major 1 (validation), `encryption` fallback (2, optional).

## Spec issues to file

1. `metadata.maps` is described in the text (with two example files in the assets) but the 2.0.0 and 2.1.0 schemas do not list `maps` under `metadata`; the `$metadata/maps` definition exists and nothing references it. A descriptor with maps fails schema validation.
2. The `calldata` parameter table lists `chainIdPath` / `chainId`; `calldataParameters` in the schema has neither.
3. The embedded-calldata examples use `required` and `excluded` keys on a format; no schema defines them.
4. The minimal contract examples use `"format": "number"` and `"format": "bytes32"`, which are not format names, and `recipients[0]` without the dot that the path rules require.
5. The `date` table shows `2024-02-29T08:27:12` while every deployed implementation renders `2026-03-19 12:11:19Z`; the `nftName` table shows a two-line form that no implementation produces. The spec should either fix the form or say that the form is wallet-specific, in which case the suite compares a structured value instead of the string.
6. `calldata` with a constant `selector`: the text does not say whether the bytes then hold only the arguments or still start with a selector that is ignored. `formats/calldata/selector-constant` assumes arguments only.
