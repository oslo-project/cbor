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
	CBORTagged,
	CBORTextString
} from "./cbor.js";

import type { CBORValue } from "./cbor.js";

export function transformCBORValueToNative(cbor: CBORValue): unknown {
	if (cbor instanceof CBORPositiveInteger || cbor instanceof CBORNegativeInteger) {
		if (cbor.isNumber()) {
			return Number(cbor.value);
		}
		return cbor.value;
	}
	if (cbor instanceof CBORTextString) {
		return cbor.decodeText();
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
		throw new CBORInvalidError();
	}
	if (cbor instanceof CBORArray) {
		const result = new Array(cbor.elements.length);
		for (let i = 0; i < cbor.elements.length; i++) {
			result[i] = transformCBORValueToNative(cbor.elements[i]);
		}
		return result;
	}
	if (cbor instanceof CBORMap) {
		const result: Record<any, any> = {};
		for (let i = 0; i < cbor.entries.length; i++) {
			const [entryKey, entryValue] = cbor.entries[i];
			let stringifiedKey: string;
			if (entryKey instanceof CBORTextString) {
				stringifiedKey = entryKey.decodeText();
			} else if (
				entryKey instanceof CBORPositiveInteger ||
				entryKey instanceof CBORNegativeInteger
			) {
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
			if (stringifiedKey === "__proto__") {
				throw new CBORInvalidError();
			}
			if (stringifiedKey in result) {
				throw new CBORInvalidError();
			}
			result[stringifiedKey] = transformCBORValueToNative(entryValue);
		}
		return result;
	}
	if (cbor instanceof CBORTagged) {
		return transformCBORValueToNative(cbor.value);
	}
	throw new CBORInvalidError();
}
