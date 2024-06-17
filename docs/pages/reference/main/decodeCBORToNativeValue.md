---
title: "decodeCBORToNativeValue()"
---

# decodeCBORToNativeValue()

Decodes the CBOR-encoded data, and returns the decoded value as native JS values and the number of bytes decoded. This just uses [`decodeCBOR()`](/reference/main/decodeCBOR) and [`transformCBORValueToNative()`](/reference/main/transformCBORValueToNative).

Use [`decodeCBORToNativeValueNoLeftoverBytes()`](/reference/main/decodeCBORToNativeValueNoLeftoverBytes) if you don't expect any leftover bytes.

It can throw one of:

- [`CBORNotWellFormedError`](/reference/main/CBORNotWellFormedError): CBOR is not well formed.
- [`CBORTooDeepError`](/reference/main/CBORTooDeepError): The CBOR data is too deep.
- [`CBORInvalidError`](/reference/main/CBORInvalidError): Invalid data.

## Definition

```ts
function decodeCBORNoLeftoverBytes(
	data: Uint8Array,
	maxDepth: number
): [data: unknown, size: number];
```

### Parameters

- `data`
- `maxDepth`: How much nesting is allowed (exclusive) where the first iteration is depth 0.
