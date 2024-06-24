---
title: "decodeCBORToNativeValueNoLeftoverBytes()"
---

# decodeCBORToNativeValueNoLeftoverBytes()

Decodes a CBOR-encoded data and returns the decoded value as native JS values. See [`decodeCBORToNativeValue()`](/reference/main/decodeCBORToNativeValue) for details on errors and behavior.

In addition to errors thrown by `decodeCBORToNativeValue()`, it will also throw [`CBORLeftoverBytesError`](/reference/main/CBORLeftoverBytesError) if there are any leftover bytes.

## Definition

```ts
function decodeCBORToNativeValueNoLeftoverBytes(data: Uint8Array, maxDepth: number): unknown;
```

### Parameters

- `data`
- `maxDepth`: How much nesting is allowed (exclusive) where the first iteration is depth 0.
