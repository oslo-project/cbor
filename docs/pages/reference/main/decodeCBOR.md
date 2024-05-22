---
title: "decodeCBOR()"
---

# decodeCBOR()

Decodes the CBOR-encoded data and returns the decoded value as [`CBORValue`]() (e.g. `CBORMap`) and the number of bytes decoded. Use [`decodeCBORNoLeftoverBytes()`]() if you don't expect any leftover bytes.

This method does NOT check for CBOR validity. It will NOT throw on:

- Text strings with invalid UTF-8 encoding
- Maps with duplicate keys
- Tagged values with invalid content type (e.g. date value with an array value)

Passing tag #55799 (self-described CBOR) returns the tagged value, not `CBORTaggedValue`.

It can throw one of:

- [`CBORNotWellFormedError`](): CBOR is not well formed
- [`CBORTooDeepError`](): The CBOR data is too deep

## Definition

```ts
//$ CBORValue=/reference/main/CBORValue
function decodeCBOR(data: Uint8Array, maxDepth: number): [data: $$CBORValue, size: number];
```

### Parameters

- `data`
- `maxDepth`: How much nesting is allowed
