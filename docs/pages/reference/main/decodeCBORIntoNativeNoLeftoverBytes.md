---
title: "decodeCBORIntoNativeNoLeftoverBytes()"
---

# decodeCBORIntoNativeNoLeftoverBytes()

Decodes a CBOR-encoded data and returns the decoded value as native JS values. See [`decodeCBORIntoNative()`](/reference/main/decodeCBORIntoNative) for details on errors and behavior.

In addition to errors thrown by `decodeCBORIntoNative()`, it will also throw [`CBORLeftoverBytesError`](/reference/main/CBORLeftoverBytesError) if there are any leftover bytes.

## Definition

```ts
function decodeCBORIntoNativeNoLeftoverBytes(data: Uint8Array, maxDepth: number): unknown;
```

### Parameters

- `data`
- `maxDepth`: How much nesting is allowed
