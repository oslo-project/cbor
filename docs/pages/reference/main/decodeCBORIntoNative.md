---
title: "decodeCBORIntoNative()"
---

# decodeCBORIntoNative()

Decodes the CBOR-encoded data and returns the decoded value as native JS values and the number of bytes decoded. Use [`decodeCBORIntoNativeNoLeftoverBytes()`](/reference/main/decodeCBORIntoNativeNoLeftoverBytes) if you don't expect any leftover bytes.

Values are decoded as:

- Positive integers: `Number` or `BigInt` depending on the size
- Negative integers: `Number` or `BigInt` depending on the size
- Byte strings: `Uint8Array`
- Text strings: `String`
- Arrays: `Array`
- Maps: JS object where integers and floats are converted to strings with `Number.toString()`. As such, integer 1 and float 1.0 are considered the same key.
- Supported tags
  - Tag #0 and #1 (date): `Date`
  - Tag #2 and #3 (bigint): `BigInt`
  - Tag #55799 (self-described CBOR): The tagged value as native JS values
- Unsupported tags: [`CBORTaggedValue`](/reference/main/CBORTaggedValue)
- Floats: `Number` where float 16 and 32 are represented as float64, which can cause minor shifts in accuracy
- Supported simple values: `true`, `false`, `null`, `undefined`
- Unsupported simple values: [`CBORSimpleValue`](/reference/main/CBORSimpleValue)

Unlike [`decodeCBOR()`](/reference/main/decodeCBOR), this also [validates](https://datatracker.ietf.org/doc/html/rfc8949#name-terminology) the data and will throw `CBORInvalidError` on:

- Text strings with invalid UTF-8
- Maps with duplicate stringified keys
- Invalid content for tag #0, #1, #2, and #3

It can throw one of:

- [`CBORNotWellFormedError`](/reference/main/CBORNotWellFormedError): CBOR is not well formed
- [`CBORTooDeepError`](/reference/main/CBORTooDeepError): The CBOR data is too deep
- [`CBORInvalidError`](/reference/main/CBORInvalidError): Invalid data

## Definition

```ts
function decodeCBORNoLeftoverBytes(
	data: Uint8Array,
	maxDepth: number
): [data: unknown, size: number];
```

### Parameters

- `data`
- `maxDepth`: How much nesting is allowed