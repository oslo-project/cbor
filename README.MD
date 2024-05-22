# @oslojs/cbor

Documentation: https://cbor.oslojs.dev

A CBOR library for JavaScript based on [RFC 8949]().

- Runtime agnostic
- No third-party dependencies
- Fully typed

```ts
import { decodeCBORIntoNativeNoLeftoverBytes } from "@oslojs/cbor";

const MAX_DEPTH = 10;
const result: Result = decodeCBORIntoNativeNoLeftoverBytes(cborBytes as Uint8Array, MAX_DEPTH);
const message: string = result.message;

interface Result {
	message: string;
}
```

> This package currently only supports decoding

## Installation

```
npm i @oslojs/cbor
```
