import { toBigIntBigEndian } from "./big.js";
import {
	CBORArray,
	CBORByteString,
	CBORFloat16,
	CBORFloat32,
	CBORFloat64,
	CBORInvalidError,
	CBORMap,
	CBORNegativeInteger,
	CBORPositiveInteger,
	CBORSimple,
	CBORTaggedValue,
	CBORTextString
} from "./cbor.js";

import type { CBORValue } from "./cbor.js";

export function transformCBORValueIntoNative(cbor: CBORValue<any>): unknown {
	if (cbor instanceof CBORPositiveInteger || cbor instanceof CBORNegativeInteger) {
		if (cbor.isNumber()) {
			return Number(cbor.value);
		}
		return cbor.value;
	}
	if (cbor instanceof CBORTextString) {
		return cbor.decode();
	}
	if (cbor instanceof CBORByteString) {
		return cbor.value;
	}
	if (cbor instanceof CBORFloat16 || cbor instanceof CBORFloat32 || cbor instanceof CBORFloat64) {
		return cbor.toNumber();
	}
	if (cbor instanceof CBORSimple) {
		if (cbor.value === 20) {
			return false;
		}
		if (cbor.value === 21) {
			return true;
		}
		if (cbor.value === 22) {
			return null;
		}
		if (cbor.value === 23) {
			return undefined;
		}
		return cbor;
	}
	if (cbor instanceof CBORArray) {
		const result = new Array(cbor.value.length);
		for (let i = 0; i < cbor.value.length; i++) {
			result[i] = transformCBORValueIntoNative(cbor.value[i]);
		}
		return result;
	}
	if (cbor instanceof CBORMap) {
		const result: object = {};
		for (let i = 0; i < cbor.value.length; i++) {
			const [entryKey, entryValue] = cbor.value[i];
			let stringifiedKey: string;
			if (entryKey instanceof CBORTextString) {
				stringifiedKey = entryKey.decode();
			} else if (
				entryKey instanceof CBORPositiveInteger ||
				entryKey instanceof CBORNegativeInteger
			) {
				if (Number.isNaN(entryKey.value)) {
					throw new CBORInvalidError();
				}
				stringifiedKey = entryKey.value.toString();
			} else if (
				entryKey instanceof CBORFloat16 ||
				entryKey instanceof CBORFloat32 ||
				entryKey instanceof CBORFloat64
			) {
				const valueNumber = entryKey.toNumber();
				if (Number.isNaN(valueNumber)) {
					throw new CBORInvalidError();
				}
				stringifiedKey = valueNumber.toString();
			} else {
				throw new CBORInvalidError();
			}
			if (stringifiedKey in result) {
				throw new CBORInvalidError();
			}
			result[stringifiedKey] = transformCBORValueIntoNative(entryValue);
		}
		return result;
	}
	if (cbor instanceof CBORTaggedValue) {
		if (cbor.tagNumber === 0n) {
			if (cbor.value instanceof CBORTextString) {
				return new Date(cbor.value.decode());
			}
			throw new CBORInvalidError();
		}
		if (cbor.tagNumber === 1n) {
			if (cbor.value instanceof CBORPositiveInteger) {
				if (cbor.value.value > Number.MAX_SAFE_INTEGER / 1000) {
					throw new CBORInvalidError();
				}
				return new Date(Number(cbor.value.value) * 1000);
			}
			if (cbor.value instanceof CBORNegativeInteger) {
				if (cbor.value.value < (Number.MIN_SAFE_INTEGER + 1) / 1000) {
					throw new CBORInvalidError();
				}
				return new Date(Number(-1 - Number(cbor.value.value)) * 1000);
			}
			if (
				cbor.value instanceof CBORFloat16 ||
				cbor.value instanceof CBORFloat32 ||
				cbor.value instanceof CBORFloat64
			) {
				const posix = cbor.value.toNumber();
				if (Number.isNaN(posix)) {
					throw new CBORInvalidError();
				}
				if (posix > Number.MAX_SAFE_INTEGER / 1000) {
					throw new CBORInvalidError();
				}
				if (posix < Number.MIN_SAFE_INTEGER / 1000) {
					throw new CBORInvalidError();
				}
				return new Date(posix * 1000);
			}
			throw new CBORInvalidError();
		}
		if (cbor.tagNumber === 2n) {
			if (cbor.value instanceof CBORByteString) {
				return toBigIntBigEndian(cbor.value.value);
			}
			throw new CBORInvalidError();
		}
		if (cbor.tagNumber === 3n) {
			if (cbor.value instanceof CBORByteString) {
				return -1n - toBigIntBigEndian(cbor.value.value);
			}
			throw new CBORInvalidError();
		}
		return cbor;
	}

	throw new CBORInvalidError();
}
