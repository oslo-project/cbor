# @oslojs/cbor

**Documentation: https://cbor.oslojs.dev**

**This package is highly experimental!**

A CBOR library for JavaScript based on [RFC 8949](https://datatracker.ietf.org/doc/html/rfc8949).

- Runtime agnostic
- No third-party dependencies
- Fully typed

```ts
import { decodeCBORIntoNativeNoLeftoverBytes } from "@oslojs/cbor";

const MAX_DEPTH = 10;
const encoded = new Uint8Array([
	0xa1, 0x67, 0x6d, 0x65, 0x73, 0x73, 0x61, 0x67, 0x65, 0x65, 0x68, 0x65, 0x6c, 0x6c, 0x6f
]);
const result: Result = decodeCBORIntoNativeNoLeftoverBytes(encoded, MAX_DEPTH);
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
