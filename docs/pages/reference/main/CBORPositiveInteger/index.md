---
title: "CBORPositiveInteger"
---

# CBORPositiveInteger

_Implements [`CBORValue`](/reference/main/CBORValue)._

Represents a CBOR positive integer (major type 0).

## Constructor

```ts
function constructor(value: bigint): value;
```

### Parameters

- `value`: A positive value (including 0)

## Methods

- [`CBORPositiveInteger.isNumber()`](/reference/main/CBORPositiveInteger/isNumber)

## Properties

```ts
interface Properties {
	value: bigint;
}
```

- `value`
