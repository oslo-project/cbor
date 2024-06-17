---
title: "CBORTagged"
---

# CBORTaggedValue

Represents a CBOR tagged value (major type 7).

## Constructor

```ts
//$ CBORValue=/reference/main/CBORValue
function constructor(tagNumber: bigint, value: $$CBORValue): this;
```

### Parameters

- `tagNumber`
- `value`

## Properties

```ts
//$ CBORValue=/reference/main/CBORValue
interface Properties {
	tagNumber: number;
	value: $$CBORValue;
}
```

- `tagNumber`
- `value`
