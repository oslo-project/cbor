---
title: "decodeCBORIntoNativeNoLeftoverBytes()"
---

# decodeCBORIntoNativeNoLeftoverBytes()

Decodes the CBOR-encoded data and returns the decoded value as native JS values and the number of bytes decoded. See [`decodeCBORIntoNative()`]() for details on errors and behavior.

In addition to errors thrown by `decodeCBORIntoNative()`, it will also throw [`CBORLeftoverBytesError`]() if there are any leftover bytes.

## Definition

```ts
function decodeCBORIntoNativeNoLeftoverBytes(data: Uint8Array, maxDepth: number): unknown;
```

### Parameters

- `data`
- `maxDepth`: How much nesting is allowed
