---
title: "transformCBORValueToNative()"
---

# transformCBORValueToNative()

Transforms the CBOR values to native JS values.

Values are decoded as:

- Positive integers ([`CBORPositiveInteger`](/reference/main/CBORPositiveInteger)): `Number` or `BigInt` depending on the size.
- Negative integers ([`CBORNegativeInteger`](/reference/main/CBORNegativeInteger)): `Number` or `BigInt` depending on the size.
- Byte strings ([`CBORByteString`](/reference/main/CBORNegativeInteger)): `Uint8Array`.
- Text strings ([`CBORTextString`](/reference/main/CBORTextString)): `String`. Those with invalid UTF-8 encoding are considered invalid.
- Arrays ([`CBORArray`](/reference/main/CBORArray)): `Array` of transformed values.
- Maps ([`CBORMap`](/reference/main/CBORMap)): JS object where integer and float keys are converted to strings with `Number.toString()`. As such, integer 1 and float 1.0 are considered the same key. Maps with duplicate keys after stringify-ing them are considered invalid. Maps with the text key `__proto__` are also considered invalid.
- Floats ([`CBORFloat16`](/reference/main/CBORFloat16), [`CBORFloat32`](/reference/main/CBORFloat32), [`CBORFloat64`](/reference/main/CBORFloat64)): `Number`. This may cause minor accuracy issues for float16 and 32.
- Simple values ([`CBORSimple`](/reference/main/CBORSimple)): `true`, `false`, `null`, `undefined`. Everything else is considered invalid.
- Tagged values ([`CBORTagged`](/reference/main/CBORTagged)): Tags are ignored and the underlying value is transformed.

Unlike [`decodeCBOR()`](/reference/main/decodeCBOR), this also [validates](https://datatracker.ietf.org/doc/html/rfc8949#name-terminology) the data and will throw [`CBORInvalidError`](/reference/main/CBORInvalidError) on invalid data.

## Definition

```ts
//$ CBORValue=/reference/main/CBORValue
function transformCBORValueToNative(cbor: $$CBORValue): unknown;
```

### Parameters

- `cbor`: CBOR values except for breaks.
