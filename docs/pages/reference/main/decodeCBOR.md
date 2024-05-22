---
title: "decodeCBOR()"
---

# decodeCBOR()

Decodes the CBOR-encoded data and returns the decoded value as [`CBORValue`](/reference/main/CBORValue) (e.g. `CBORMap`) and the number of bytes decoded. Use [`decodeCBORNoLeftoverBytes()`](/reference/main/decodeCBORNoLeftoverBytes) if you don't expect any leftover bytes.

This method does NOT check for CBOR [validity](https://datatracker.ietf.org/doc/html/rfc8949#name-terminology). As such, it will NOT throw on:

- Text strings with invalid UTF-8 encoding
- Maps with duplicate keys
- Tagged values with invalid content type (e.g. date value with an array value)

Passing tag #55799 (self-described CBOR) returns the tagged value, not `CBORTaggedValue`.

It can throw one of:

- [`CBORNotWellFormedError`](/reference/main/CBORNotWellFormedError): CBOR is not [well-formed](https://datatracker.ietf.org/doc/html/rfc8949#name-terminology)
- [`CBORTooDeepError`](/reference/main/CBORTooDeepError): The CBOR data is too deep

## Definition

```ts
//$ CBORValue=/reference/main/CBORValue
function decodeCBOR(data: Uint8Array, maxDepth: number): [data: $$CBORValue, size: number];
```

### Parameters

- `data`
- `maxDepth`: How much nesting is allowed
