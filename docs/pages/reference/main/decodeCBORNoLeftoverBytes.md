---
title: "decodeCBORNoLeftoverBytes()"
---

# decodeCBORNoLeftoverBytes()

Decodes the CBOR-encoded data and returns the decoded value as [`CBORValue`](/reference/main/CBORValue) (e.g. `CBORMap`). See [`decodeCBOR()`](/reference/main/decodeCBOR) for details on errors and behavior.

In addition to errors thrown by `decodeCBOR()`, it will also throw [`CBORLeftoverBytesError`](/reference/main/CBORLeftoverBytesError) if there are any leftover bytes.

## Definition

```ts
//$ CBORValue=/reference/main/CBORValue
function decodeCBORNoLeftoverBytes(data: Uint8Array, maxDepth: number): $$CBORValue;
```

### Parameters

- `data`
- `maxDepth`: How much nesting is allowed
