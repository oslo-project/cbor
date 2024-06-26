---
title: "CBORNegativeInteger"
---

# CBORNegativeInteger

Represents a CBOR negative integer (major type 1).

## Constructor

```ts
function constructor(value: bigint): value;
```

### Parameters

- `value`: A negative value (excluding 0)

## Methods

- [`CBORNegativeInteger.isNumber()`](/reference/main/CBORNegativeInteger/isNumber)

## Properties

```ts
interface Properties {
	value: bigint;
}
```

- `value`
