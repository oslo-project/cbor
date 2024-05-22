---
title: "CBORFloat32"
---

# CBORFloat32

_Implements [`CBORValue`](/reference/main/CBORValue)._

Represents a CBOR float32 (major type 7).

## Constructor

```ts
function constructor(value: Uint8Array): this;
```

### Parameters

- `value`: Value represented as exactly 4 bytes (big-endian)

## Methods

- [`CBORFloat32.toNumber()`]()

## Properties

```ts
interface Properties {
	value: Uint8Array;
}
```

- `value`
