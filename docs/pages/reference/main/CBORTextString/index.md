---
title: "CBORTextString"
---

# CBORTextString

_Implements [`CBORValue`](/reference/main/CBORValue)._

Represents a CBOR text string (major type 3).

## Constructor

```ts
function constructor(value: Uint8Array): this;
```

### Parameters

- `value`: UTF-8 encoded string

## Methods

- [`CBORTextString.decode()`]()

## Properties

```ts
interface Properties {
	value: Uint8Array;
}
```

- `value`: UTF-8 encoded string
