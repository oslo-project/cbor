import { compareBytes } from "@oslojs/binary";
import { toFloat16, toFloat32, toFloat64 } from "./float.js";

export interface CBORValue<T = any> {
	value: T;
}

export class CBORPositiveInteger implements CBORValue<bigint> {
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

export class CBORNegativeInteger implements CBORValue<bigint> {
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

export class CBORByteString implements CBORValue<Uint8Array> {
	public value: Uint8Array;

	constructor(value: Uint8Array) {
		this.value = value;
	}
}

export class CBORTextString implements CBORValue<Uint8Array> {
	public value: Uint8Array;

	constructor(value: Uint8Array) {
		this.value = value;
	}

	public decode(): string {
		try {
			return new TextDecoder("utf-8", {
				fatal: true
			}).decode(this.value);
		} catch {
			throw new CBORInvalidError();
		}
	}
}

export class CBORArray implements CBORValue<CBORValue[]> {
	public value: CBORValue[];

	constructor(value: CBORValue[]) {
		this.value = value;
	}
}

export class CBORMap implements CBORValue<[CBORValue, CBORValue][]> {
	public value: [CBORValue, CBORValue][];

	constructor(value: [CBORValue, CBORValue][]) {
		this.value = value;
	}

	public has(key: CBORValue): boolean {
		for (const [entryKey] of this.value) {
			if (compareCBORValues(key, entryKey)) {
				return true;
			}
		}
		return false;
	}

	public get(key: CBORValue): CBORValue | null {
		for (const [entryKey, entryValue] of this.value) {
			if (compareCBORValues(key, entryKey)) {
				return entryValue;
			}
		}
		return null;
	}

	public getAll(key: CBORValue): CBORValue[] {
		const result: CBORValue[] = [];
		for (const [entryKey, entryValue] of this.value) {
			if (compareCBORValues(key, entryKey)) {
				result.push(entryValue);
			}
		}
		return result;
	}

	public hasDuplicateKeys(): boolean {
		for (let i = 0; i < this.value.length; i++) {
			for (let j = i + 1; j < this.value.length; j++) {
				if (compareCBORValues(this.value[i][0], this.value[j][0])) {
					return true;
				}
			}
		}
		return false;
	}
}

export class CBORFloat16 implements CBORValue<Uint8Array> {
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

export class CBORFloat32 implements CBORValue<Uint8Array> {
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

export class CBORFloat64 implements CBORValue<Uint8Array> {
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

export class CBORTaggedValue<T> implements CBORValue<T> {
	public tagNumber: bigint;
	public value: T;

	constructor(tagNumber: bigint, value: T) {
		this.tagNumber = tagNumber;
		this.value = value;
	}
}

export class CBORSimple implements CBORValue<number> {
	public value: number;

	constructor(value: number) {
		this.value = value;
	}
}

export class CBORBreak implements CBORValue<null> {
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
	if (a instanceof CBORTaggedValue && b instanceof CBORTaggedValue) {
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
		if (a.value.length !== b.value.length) {
			return false;
		}
		for (let i = 0; i < a.value.length; i++) {
			if (!compareCBORValues(a.value[i], b.value[i])) {
				return false;
			}
		}
		return true;
	}
	if (a instanceof CBORMap && b instanceof CBORMap) {
		if (a.value.length !== b.value.length) {
			return false;
		}
		const checkedIndexes: number[] = [];
		for (let i = 0; i < a.value.length; i++) {
			for (let j = 0; j < b.value.length; j++) {
				if (!checkedIndexes.includes(i)) {
					if (!compareCBORValues(a.value[i][0], b.value[j][0])) {
						continue;
					}
					if (!compareCBORValues(a.value[i][1], b.value[j][1])) {
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
