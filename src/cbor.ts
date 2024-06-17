import { compareBytes } from "@oslojs/binary";
import { toFloat16, toFloat32, toFloat64 } from "./float.js";

export type CBORValue =
	| CBORPositiveInteger
	| CBORNegativeInteger
	| CBORByteString
	| CBORTextString
	| CBORArray
	| CBORMap
	| CBORFloat16
	| CBORFloat32
	| CBORFloat64
	| CBORTagged
	| CBORSimple
	| CBORBreak;

export class CBORPositiveInteger {
	public value: bigint;

	constructor(value: bigint) {
		if (value < 0) {
			throw new TypeError();
		}
		this.value = value;
	}

	public isNumber(): boolean {
		return BigInt(Number(this.value)) === this.value;
	}
}

export class CBORNegativeInteger {
	public value: bigint;

	constructor(value: bigint) {
		if (value > -1) {
			throw new TypeError();
		}
		this.value = value;
	}

	public isNumber(): boolean {
		return BigInt(Number(this.value)) === this.value;
	}
}

export class CBORByteString {
	public value: Uint8Array;

	constructor(value: Uint8Array) {
		this.value = value;
	}
}

export class CBORTextString {
	public value: Uint8Array;

	constructor(value: Uint8Array) {
		this.value = value;
	}

	public decodeText(): string {
		try {
			return new TextDecoder("utf-8", {
				fatal: true
			}).decode(this.value);
		} catch {
			throw new CBORInvalidError();
		}
	}
}

export class CBORArray {
	public elements: CBORValue[];

	constructor(elements: CBORValue[]) {
		this.elements = elements;
	}
}

export class CBORMap {
	public entries: [CBORValue, CBORValue][];

	constructor(entries: [CBORValue, CBORValue][]) {
		this.entries = entries;
	}

	public has(key: CBORValue): boolean {
		for (const [entryKey] of this.entries) {
			if (compareCBORValues(key, entryKey)) {
				return true;
			}
		}
		return false;
	}

	public get(key: CBORValue): CBORValue | null {
		for (const [entryKey, entryValue] of this.entries) {
			if (compareCBORValues(key, entryKey)) {
				return entryValue;
			}
		}
		return null;
	}

	public getAll(key: CBORValue): CBORValue[] {
		const result: CBORValue[] = [];
		for (const [entryKey, entryValue] of this.entries) {
			if (compareCBORValues(key, entryKey)) {
				result.push(entryValue);
			}
		}
		return result;
	}

	public hasDuplicateKeys(): boolean {
		for (let i = 0; i < this.entries.length; i++) {
			for (let j = i + 1; j < this.entries.length; j++) {
				if (compareCBORValues(this.entries[i][0], this.entries[j][0])) {
					return true;
				}
			}
		}
		return false;
	}
}

export class CBORFloat16 {
	public value: Uint8Array;

	constructor(value: Uint8Array) {
		if (value.byteLength !== 2) {
			throw new TypeError();
		}
		this.value = value;
	}

	public toNumber(): number {
		return toFloat16(this.value);
	}
}

export class CBORFloat32 {
	public value: Uint8Array;

	constructor(value: Uint8Array) {
		if (value.byteLength !== 4) {
			throw new TypeError();
		}
		this.value = value;
	}

	public toNumber(): number {
		return toFloat32(this.value);
	}
}

export class CBORFloat64 {
	public value: Uint8Array;

	constructor(value: Uint8Array) {
		if (value.byteLength !== 8) {
			throw new TypeError();
		}
		this.value = value;
	}

	public toNumber(): number {
		return toFloat64(this.value);
	}
}

export class CBORTagged {
	public tagNumber: bigint;
	public value: CBORValue;

	constructor(tagNumber: bigint, value: CBORValue) {
		this.tagNumber = tagNumber;
		this.value = value;
	}
}

export class CBORSimple {
	public value: number;

	constructor(value: number) {
		this.value = value;
	}
}

export class CBORBreak {
	public value = null;
}

export function compareCBORValues(a: CBORValue, b: CBORValue): boolean {
	if (a instanceof CBORPositiveInteger && b instanceof CBORPositiveInteger) {
		return a.value === b.value;
	}
	if (a instanceof CBORNegativeInteger && b instanceof CBORNegativeInteger) {
		return a.value === b.value;
	}
	if (a instanceof CBORByteString && b instanceof CBORByteString) {
		return compareBytes(a.value, b.value);
	}
	if (a instanceof CBORTextString && b instanceof CBORTextString) {
		return a.value === b.value;
	}
	if (a instanceof CBORSimple && b instanceof CBORSimple) {
		return a.value === b.value;
	}
	if (a instanceof CBORTagged && b instanceof CBORTagged) {
		return a.tagNumber === b.tagNumber && compareCBORValues(a.value, b.value);
	}
	if (a instanceof CBORFloat16 && b instanceof CBORFloat16) {
		return compareBytes(a.value, b.value);
	}
	if (a instanceof CBORFloat32 && b instanceof CBORFloat32) {
		return compareBytes(a.value, b.value);
	}
	if (a instanceof CBORFloat64 && b instanceof CBORFloat64) {
		return compareBytes(a.value, b.value);
	}
	if (a instanceof CBORArray && b instanceof CBORArray) {
		if (a.elements.length !== b.elements.length) {
			return false;
		}
		for (let i = 0; i < a.elements.length; i++) {
			if (!compareCBORValues(a.elements[i], b.elements[i])) {
				return false;
			}
		}
		return true;
	}
	if (a instanceof CBORMap && b instanceof CBORMap) {
		if (a.entries.length !== b.entries.length) {
			return false;
		}
		const checkedIndexes: number[] = [];
		for (let i = 0; i < a.entries.length; i++) {
			for (let j = 0; j < b.entries.length; j++) {
				if (!checkedIndexes.includes(i)) {
					if (!compareCBORValues(a.entries[i][0], b.entries[j][0])) {
						continue;
					}
					if (!compareCBORValues(a.entries[i][1], b.entries[j][1])) {
						// Support duplicate keys
						continue;
					}
					checkedIndexes.push(j);
					break;
				}
			}
			if (checkedIndexes.length !== i + 1) {
				return false;
			}
		}
		return true;
	}
	return false;
}

export class CBORNotWellFormedError extends Error {
	constructor() {
		super("CBOR is not well-formed");
	}
}

export class CBORLeftoverBytesError extends Error {
	constructor(count: number) {
		super(`Leftover bytes: ${count}`);
	}
}

export class CBORTooDeepError extends Error {
	constructor() {
		super("Exceeds maximum depth");
	}
}

export class CBORInvalidError extends Error {
	constructor() {
		super("Invalid CBOR");
	}
}
