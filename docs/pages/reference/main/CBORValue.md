---
title: "CBORValue"
---

# CBORValue

Represents all CBOR values.

## Definition

```ts
//$ CBORPositiveInteger=/reference/main/CBORPositiveInteger
//$ CBORNegativeInteger=/reference/main/CBORNegativeInteger
//$ CBORByteString=/reference/main/CBORByteString
//$ CBORTextString=/reference/main/CBORTextString
//$ CBORArray=/reference/main/CBORArray
//$ CBORMap=/reference/main/CBORMap
//$ CBORFloat16=/reference/main/CBORFloat16
//$ CBORFloat32=/reference/main/CBORFloat32
//$ CBORFloat64=/reference/main/CBORFloat64
//$ CBORTagged=/reference/main/CBORTagged
//$ CBORSimple=/reference/main/CBORSimple
//$ CBORBreak=/reference/main/CBORBreak
type CBORValue =
	| $$CBORPositiveInteger
	| $$CBORNegativeInteger
	| $$CBORByteString
	| $$CBORTextString
	| $$CBORArray
	| $$CBORMap
	| $$CBORFloat16
	| $$CBORFloat32
	| $$CBORFloat64
	| $$CBORTagged
	| $$CBORSimple
	| $$CBORBreak;
```
