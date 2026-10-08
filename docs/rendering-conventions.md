# Rendering conventions

The suite compares `fields[].value` strings exactly. The spec fixes the content of a rendered value but not always its exact form. This page fixes the form. Where the spec gives an example, the example is the rule. Where the spec is silent, the rule follows the 307 test files of the registry, which two implementations already pass. Open items are marked; a case that depends on an open item is not written until the item is closed.

Every rule here is a candidate for the spec text. When one moves into the spec, this page cites the spec instead.

## Numbers

- Decimal point `.`. No thousands separator. No exponent.
- Trailing zeros after the point are dropped; a whole number has no point: `1`, `0.5`, `0.000001`, `0`.
- Integers are shown in full, never truncated or rounded.

## Per format

| Format | Form | Source |
|---|---|---|
| `raw` on `uint`/`int` | plain decimal, `1000` | spec example `Value 1000 displayed as 1000` |
| `raw` on `address` | ERC-55 checksum, full length, `0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed` | spec says ERC-55; truncation is "device dependent", so the suite expects the full address |
| `raw` on `bytes`/`bytesN` | `0x` + lower-case hex, `0x123456789a` | spec example shows hex without prefix; registry files use the `0x` prefix. **Open**: prefix or not. The suite uses the prefix until decided. |
| `raw` on `string` | the UTF-8 string | spec |
| `raw` on `bool` | `true` / `false` | registry |
| `amount` | `<number> <native ticker>`, `0.19866144 ETH`; at or above `threshold` (2.1.0): `<message>`, default `All` | spec examples |
| `tokenAmount` | `<number> <symbol>`, `1 DAI`; at or above `threshold`: `<message> <symbol>`, default message `Unlimited`; token in `nativeCurrencyAddress`: native ticker, `0.002 ETH` | spec examples |
| `tokenAmount`, token unknown | plain integer, `1000000` | spec: "SHOULD display the raw value instead with an 'Unknown token' warning"; `optional/` only |
| `tokenTicker` | `<symbol>` | spec |
| `nftName` | **Open.** Spec example: `Collection Name: BoredApeYachtClub` and `Token ID: 1036` on two lines. Registry: `<collection name> #<id>`, `pFT NFT #141`. | |
| `date` | **Open.** Spec example: `2024-02-29T08:27:12` (RFC 3339 recommended, no zone shown). Registry: `2026-03-19 12:11:19Z`. | |
| `duration` | `HH:MM:SS`, hours unbounded and at least two digits, `02:17:30`, `8760:00:00` | spec example and registry |
| `unit` | `<number><base>` with no space, `10h`, `1.5d`; with `prefix`: SI prefix before the base, `36ks` | spec examples. Registry has both `0.3%` and `2.5 wstETH`; the spec form wins. |
| `enum` | the mapped string | spec |
| `enum`, value not in the enum | **Open.** Spec is silent. | |
| `chainId` | the chain name, `Ethereum Mainnet`, from `dataProvider.chainNames` | spec example |
| `addressName` | the trusted name when a source has one, else the ERC-55 address; an address in `senderAddress`: `Sender` | spec examples |
| `interoperableAddressName` | `<ERC-55 address>@eip155:<chainId>#<checksum>`, `0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045@eip155:1#4CA88C9C` | spec example |
| `calldata`, descriptor found | a nested rendered output object, not a string | registry results contract |
| `calldata`, no descriptor | **Open.** Spec: "MAY display a hash". Registry: the raw hex. `optional/` only. | |

Native tickers come from the chain id. The suite uses chain 1 (`ETH`) unless a case is about another chain; then `dataProvider.chainNames` carries the name and the case states the ticker in its description.

## Intent, owner, labels

- `intent` is copied from the descriptor: the string, or the object as is.
- `interpolatedIntent` is the template with every `{path}` replaced by the field's rendered value, `{{`/`}}` unescaped. When any placeholder cannot be resolved, the field is absent from `expected`, because the spec says the wallet falls back to `intent`.
- `owner` is `metadata.owner`. Absent when the descriptor has none.
- `label` is the descriptor's label, unchanged. A field with no label still appears, with `label` equal to the empty string. **Open**: confirm with implementers.

## Which fields appear

- Fields appear in descriptor order, after `includes` are merged and groups are flattened.
- `visible: never` and `visible: { mustMatch }` fields do not appear.
- `visible: optional` fields: the spec says the wallet MAY show them, so the suite cannot require either. Cases with `optional` fields go in `optional/`.
- `visible: { ifNotIn }` fields appear unless the value is in the list.
- A `mustMatch` field whose value is not in the list makes the whole case a no-match (`reason: mustMatch`).
- An array field produces one entry per element, each with the same label. `separator` text is **open**: the registry results contract has no place for it.
