---
title: "CBORByteString"
---

# CBORByteString

_Implements [`CBORValue`](/reference/main/CBORValue)._

Represents a CBOR byte string (major type 2).

## Constructor

```ts
function constructor(value: Uint8Array): this;
```

### Parameters

- `value`

## Properties

```ts
interface Properties {
	value: Uint8Array;
}
```

- `value`
