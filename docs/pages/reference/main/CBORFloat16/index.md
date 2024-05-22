---
title: "CBORFloat16"
---

# CBORFloat16

_Implements [`CBORValue`](/reference/main/CBORValue)._

Represents a CBOR float16 (major type 7).

## Constructor

```ts
function constructor(value: Uint8Array): this;
```

### Parameters

- `value`: Value represented as exactly 2 bytes (big-endian)

## Methods

- [`CBORFloat16.toNumber()`](/reference/main/CBORFloat16/toNumber)

## Properties

```ts
interface Properties {
	value: Uint8Array;
}
```

- `value`
