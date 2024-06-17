---
title: "CBORMap"
---

# CBORMaps

Represents a CBOR float64 (major type 5). Allows duplicate keys.

Keys are compared by checked the type and value. Here, float16, and float32, and float64 are considered distinct types. While maps can be used as keys, using them can cause performance issues when querying values. Tagged values are compared using both the tag and the value.

## Constructor

```ts
//$ CBORValue=/reference/main/CBORValue
function constructor(entries: [$$CBORValue, $$CBORValue][]): this;
```

### Parameters

- `entries`: Key-value pairs

## Methods

- [`CBORMap.get()`](/reference/main/CBORMap/get)
- [`CBORMap.getAll()`](/reference/main/CBORMap/getAll)
- [`CBORMap.has()`](/reference/main/CBORMap/has)
- [`CBORMap.hasDuplicateKeys()`](/reference/main/CBORMap/hasDuplicateKeys)

## Properties

```ts
//$ CBORValue=/reference/main/CBORValue
interface Properties {
	entries: [$$CBORValue, $$CBORValue][];
}
```

- `value`
