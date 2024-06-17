---
title: "CBORFloat64"
---

# CBORFloat64

Represents a CBOR float64 (major type 7).

## Constructor

```ts
function constructor(value: Uint8Array): this;
```

### Parameters

- `value`: Value represented as exactly 8 bytes (big-endian)

## Methods

- [`CBORFloat64.toNumber()`](/reference/main/CBORFloat64/toNumber)

## Properties

```ts
interface Properties {
	value: Uint8Array;
}
```

- `value`
