---
title: "CBORTaggedValue"
---

# CBORTaggedValue

_Implements [`CBORValue`](/reference/main/CBORValue)._

Represents a CBOR tagged value (major type 7).

## Constructor

```ts
//$ CBORValue=/reference/main/CBORValue
function constructor(tagNumber: bigint, value: CBORValue): this;
```

### Parameters

- `tagNumber`
- `value`

## Properties

```ts
interface Properties {
	value: number;
}
```

- `value`
