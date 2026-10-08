#!/usr/bin/env node
// Builds the rawTx of every calldata case that has a `call` block, and writes it back
// into the file. Run on a test file after you edit a `call`:
//
//   node tools/encode-call.mjs tests/2.1.0/formats/amount-threshold.tests.json
//
// The transaction is an unsigned EIP-1559 transaction. Every field that is not part
// of the case is fixed, so that the same `call` always gives the same `rawTx`:
// nonce 0, gas 1000000, maxFeePerGas 1 gwei, maxPriorityFeePerGas 1 gwei, no access list.

import { readFileSync, writeFileSync } from 'node:fs';
import { encodeFunctionData, parseAbiItem, serializeTransaction } from 'viem';

const FIXED = {
  nonce: 0,
  gas: 1_000_000n,
  maxFeePerGas: 1_000_000_000n,
  maxPriorityFeePerGas: 1_000_000_000n,
};

function toBigInt(v) {
  if (typeof v === 'bigint') return v;
  if (typeof v === 'number') return BigInt(v);
  if (typeof v === 'string') return v.startsWith('0x') || v.startsWith('-0x') ? BigInt(v) : BigInt(v);
  throw new Error(`cannot convert ${JSON.stringify(v)} to an integer`);
}

// Converts the JSON form of an argument to what viem's encoder wants, guided by the ABI type.
function convertArg(type, value, components) {
  const arrayMatch = type.match(/^(.*)\[(\d*)\]$/);
  if (arrayMatch) {
    if (!Array.isArray(value)) throw new Error(`expected an array for ${type}`);
    return value.map((v) => convertArg(arrayMatch[1], v, components));
  }
  if (type === 'tuple') {
    if (Array.isArray(value)) return value.map((v, i) => convertArg(components[i].type, v, components[i].components));
    return components.map((c) => convertArg(c.type, value[c.name], c.components));
  }
  if (/^u?int/.test(type)) return toBigInt(value);
  if (type === 'bool') return Boolean(value);
  return value; // address, bytes, bytesN, string
}

export function encodeCall(call) {
  let data = '0x';
  if (call.function) {
    const item = parseAbiItem(`function ${call.function}`);
    const args = (call.args ?? []).map((a, i) => convertArg(item.inputs[i].type, a, item.inputs[i].components));
    data = encodeFunctionData({ abi: [item], functionName: item.name, args });
  } else if (call.data) {
    data = call.data;
  }
  return serializeTransaction({
    type: 'eip1559',
    chainId: call.chainId,
    to: call.to,
    value: call.value === undefined ? 0n : toBigInt(call.value),
    data,
    ...FIXED,
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    console.error('usage: node tools/encode-call.mjs <tests.json> [...]');
    process.exit(2);
  }
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    const doc = JSON.parse(text);
    let changed = 0;
    for (const t of doc.tests ?? []) {
      if (!t.call) continue;
      const rawTx = encodeCall(t.call);
      if (t.rawTx !== rawTx) {
        t.rawTx = rawTx;
        changed++;
      }
    }
    if (changed > 0) {
      writeFileSync(file, JSON.stringify(doc, null, 2) + '\n');
    }
    console.log(`${file}: ${changed} rawTx value(s) written`);
  }
}
