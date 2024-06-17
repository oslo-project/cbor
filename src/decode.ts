import { bigEndian, DynamicBuffer } from "@oslojs/binary";
import { transformCBORValueToNative } from "./transform.js";
import {
	CBORArray,
	CBORBreak,
	CBORByteString,
	CBORFloat16,
	CBORFloat32,
	CBORFloat64,
	CBORLeftoverBytesError,
	CBORMap,
	CBORNegativeInteger,
	CBORNotWellFormedError,
	CBORPositiveInteger,
	CBORSimple,
	CBORTagged,
	CBORTextString,
	CBORTooDeepError
} from "./cbor.js";

import type { CBORValue } from "./cbor.js";

export function decodeCBORToNativeValueNoLeftoverBytes(
	data: Uint8Array,
	maxDepth: number
): unknown {
	const decoded = decodeCBORNoLeftoverBytes(data, maxDepth);
	return transformCBORValueToNative(decoded);
}

export function decodeCBORToNativeValue(
	data: Uint8Array,
	maxDepth: number
): [value: unknown, size: number] {
	const [decoded, size] = decodeCBOR(data, maxDepth);
	return [transformCBORValueToNative(decoded), size];
}

export function decodeCBORNoLeftoverBytes(data: Uint8Array, maxDepth: number): CBORValue {
	const [result, size] = decodeCBOR(data, maxDepth);
	if (size !== data.byteLength) {
		throw new CBORLeftoverBytesError(data.byteLength - size);
	}
	return result;
}

export function decodeCBOR(data: Uint8Array, maxDepth: number): [data: CBORValue, size: number] {
	const [value, size] = decodeCBORIncludingBreaks(data, maxDepth, 0);
	if (value instanceof CBORBreak) {
		throw new CBORNotWellFormedError();
	}
	return [value, size];
}

function decodeCBORIncludingBreaks(
	data: Uint8Array,
	maxDepth: number,
	currentDepth: number
): [data: CBORValue, size: number] {
	if (currentDepth > maxDepth) {
		throw new CBORTooDeepError();
	}
	if (data.byteLength < 1) {
		throw new CBORNotWellFormedError();
	}
	const majorType = data[0] >> 5;

	if (majorType === 0) {
		// Positive integer
		const additionalInformation = data[0] & 0x1f;
		if (additionalInformation < 24) {
			return [new CBORPositiveInteger(BigInt(additionalInformation)), 1];
		}
		const argumentSize = getArgumentSize(additionalInformation);
		const value = getVariableUint(data, argumentSize, 1);
		return [new CBORPositiveInteger(value), 1 + argumentSize];
	}

	if (majorType === 1) {
		// Negative Integer
		const additionalInformation = data[0] & 0x1f;
		if (additionalInformation < 24) {
			return [new CBORNegativeInteger(BigInt(-1 - additionalInformation)), 1];
		}
		const argumentSize = getArgumentSize(additionalInformation);
		const value = getVariableUint(data, argumentSize, 1);
		return [new CBORNegativeInteger(-1n - BigInt(value)), 1 + argumentSize];
	}

	if (majorType === 2) {
		// Byte string
		const additionalInformation = data[0] & 0x1f;

		if (additionalInformation === 31) {
			// Indefinite size
			let offset = 1;
			let size = offset;
			const buffer = new DynamicBuffer(0);
			// eslint-disable-next-line no-constant-condition
			while (true) {
				if (data.byteLength < offset + 1) {
					throw new CBORNotWellFormedError();
				}

				const innerMajorType = data[offset] >> 5;
				const innerAdditionalInformation = data[offset] & 0x1f;
				if (innerMajorType === 7 && innerAdditionalInformation === 31) {
					// Break
					size += 1;
					break;
				}
				if (innerMajorType !== 2) {
					throw new CBORNotWellFormedError();
				}

				let innerByteSize: number;
				let innerOffset: number;
				if (innerAdditionalInformation < 24) {
					innerByteSize = innerAdditionalInformation;
					innerOffset = 1;
				} else {
					const innerArgumentSize = getArgumentSize(innerAdditionalInformation);
					innerByteSize = Number(getVariableUint(data, innerArgumentSize, offset + 1));
					innerOffset = 1 + innerArgumentSize;
				}
				if (data.byteLength < offset + innerByteSize) {
					throw new CBORNotWellFormedError();
				}
				buffer.write(data.subarray(offset + innerOffset, offset + innerOffset + innerByteSize));
				size += innerOffset + innerByteSize;
				offset += innerOffset + innerByteSize;
			}
			return [new CBORByteString(buffer.bytes()), size];
		}

		let offset: number;
		let byteSize: number;
		if (additionalInformation < 24) {
			byteSize = additionalInformation;
			offset = 1;
		} else {
			const argumentSize = getArgumentSize(additionalInformation);
			byteSize = Number(getVariableUint(data, argumentSize, 1));
			offset = 1 + argumentSize;
		}
		if (data.byteLength < offset + byteSize) {
			throw new CBORNotWellFormedError();
		}
		const value = data.slice(offset, offset + byteSize);
		return [new CBORByteString(value), offset + byteSize];
	}

	if (majorType === 3) {
		// Text string
		const additionalInformation = data[0] & 0x1f;
		let offset: number;
		if (additionalInformation === 31) {
			// Indefinite size
			offset = 1;
			let size = offset;
			const buffer = new DynamicBuffer(0);
			// eslint-disable-next-line no-constant-condition
			while (true) {
				if (data.byteLength < offset + 1) {
					throw new CBORNotWellFormedError();
				}

				const innerMajorType = data[offset] >> 5;
				const innerAdditionalInformation = data[offset] & 0x1f;
				if (innerMajorType === 7 && innerAdditionalInformation === 31) {
					// Break
					offset += 1;
					size += 1;
					break;
				}
				if (innerMajorType !== 3) {
					throw new CBORNotWellFormedError();
				}

				let innerByteSize: number;
				let innerOffset: number;
				if (innerAdditionalInformation < 24) {
					innerByteSize = innerAdditionalInformation;
					innerOffset = 1;
				} else {
					const innerArgumentSize = getArgumentSize(innerAdditionalInformation);
					innerByteSize = Number(getVariableUint(data, innerArgumentSize, offset + 1));
					innerOffset = 1 + innerArgumentSize;
				}
				if (data.byteLength < offset + innerByteSize) {
					throw new CBORNotWellFormedError();
				}
				buffer.write(data.subarray(offset + innerOffset, offset + innerOffset + innerByteSize));
				size += innerOffset + innerByteSize;
				offset += innerOffset + innerByteSize;
			}
			return [new CBORTextString(buffer.bytes()), size];
		}

		let byteSize: number;
		if (additionalInformation < 24) {
			byteSize = additionalInformation;
			offset = 1;
		} else {
			const argumentSize = getArgumentSize(additionalInformation);
			byteSize = Number(getVariableUint(data, argumentSize, 1));
			offset = 1 + argumentSize;
		}
		if (data.byteLength < offset + byteSize) {
			throw new CBORNotWellFormedError();
		}
		const value = data.slice(offset, offset + byteSize);
		return [new CBORTextString(value), offset + byteSize];
	}

	if (majorType === 4) {
		// Array
		const additionalInformation = data[0] & 0x1f;
		let offset = 1;
		if (additionalInformation === 31) {
			let size = offset;
			const elements: CBORValue[] = [];
			// eslint-disable-next-line no-constant-condition
			while (true) {
				const [element, elementByteSize] = decodeCBORIncludingBreaks(
					data.subarray(offset),
					maxDepth,
					currentDepth + 1
				);
				size += elementByteSize;
				if (element instanceof CBORBreak) {
					break;
				}
				offset += elementByteSize;
				elements.push(element);
			}
			return [new CBORArray(elements), size];
		}

		let arraySize: number;
		if (additionalInformation < 24) {
			arraySize = additionalInformation;
		} else {
			const argumentSize = getArgumentSize(additionalInformation);
			arraySize = Number(getVariableUint(data, argumentSize, 1));
			offset += argumentSize;
		}

		const elements: CBORValue[] = new Array(arraySize);
		let size = offset;
		for (let i = 0; i < arraySize; i++) {
			const [element, elementByteSize] = decodeCBORIncludingBreaks(
				data.subarray(offset),
				maxDepth,
				currentDepth + 1
			);
			if (element instanceof CBORBreak) {
				throw new CBORNotWellFormedError();
			}
			offset += elementByteSize;
			size += elementByteSize;
			elements[i] = element;
		}
		return [new CBORArray(elements), size];
	}

	if (majorType === 5) {
		// Map
		const additionalInformation = data[0] & 0x1f;
		let offset = 1;
		if (additionalInformation === 31) {
			let size = offset;
			const entries: [CBORValue, CBORValue][] = [];
			// eslint-disable-next-line no-constant-condition
			while (true) {
				const [entryKey, keyByteSize] = decodeCBORIncludingBreaks(
					data.subarray(offset),
					maxDepth,
					currentDepth + 1
				);
				if (entryKey instanceof CBORBreak) {
					size += keyByteSize;
					break;
				}
				offset += keyByteSize;
				size += keyByteSize;

				const [entryValue, valueByteSize] = decodeCBORIncludingBreaks(
					data.subarray(offset),
					maxDepth,
					currentDepth + 1
				);
				if (entryValue instanceof CBORBreak) {
					throw new CBORNotWellFormedError();
				}
				entries.push([entryKey, entryValue]);
				offset += valueByteSize;
				size += valueByteSize;
			}
			return [new CBORMap(entries), size];
		}

		let pairCount: number;
		if (additionalInformation < 24) {
			pairCount = additionalInformation;
		} else {
			const argumentSize = getArgumentSize(additionalInformation);
			pairCount = Number(getVariableUint(data, argumentSize, 1));
			offset += argumentSize;
		}
		if (pairCount > data.byteLength) {
			throw new CBORNotWellFormedError();
		}

		const value: [CBORValue, CBORValue][] = new Array(pairCount);
		let size = offset;
		for (let i = 0; i < pairCount; i++) {
			const [entryKey, keyByteSize] = decodeCBORIncludingBreaks(
				data.subarray(offset),
				maxDepth,
				currentDepth + 1
			);
			if (entryKey instanceof CBORBreak) {
				throw new CBORNotWellFormedError();
			}
			offset += keyByteSize;
			size += keyByteSize;

			const [entryValue, valueByteSize] = decodeCBORIncludingBreaks(
				data.subarray(offset),
				maxDepth,
				currentDepth + 1
			);
			if (entryValue instanceof CBORBreak) {
				throw new CBORNotWellFormedError();
			}
			value[i] = [entryKey, entryValue];
			offset += valueByteSize;
			size += valueByteSize;
		}
		return [new CBORMap(value), size];
	}

	if (majorType === 6) {
		// Tagged
		const additionalInformation = data[0] & 0x1f;
		let tagNumber: bigint;
		let headSize: number;
		if (additionalInformation < 24) {
			tagNumber = BigInt(additionalInformation);
			headSize = 1;
		} else {
			const argumentSize = getArgumentSize(additionalInformation);
			tagNumber = getVariableUint(data, argumentSize, 1);
			headSize = 1 + argumentSize;
		}
		const [value, valueSize] = decodeCBORIncludingBreaks(
			data.subarray(headSize),
			maxDepth,
			currentDepth + 1
		);
		return [new CBORTagged(tagNumber, value), headSize + valueSize];
	}

	if (majorType === 7) {
		// Simple value, float, or break
		const additionalInformation = data[0] & 0x1f;
		if (additionalInformation < 24) {
			// Simple value
			return [new CBORSimple(additionalInformation), 1];
		}
		if (additionalInformation === 24) {
			// Simple value
			if (data.byteLength < 2) {
				throw new CBORNotWellFormedError();
			}
			if (data[1] < 24) {
				throw new CBORNotWellFormedError();
			}
			return [new CBORSimple(data[1]), 2];
		}
		if (additionalInformation === 25) {
			// Float16
			if (data.byteLength < 2) {
				throw new CBORNotWellFormedError();
			}
			return [new CBORFloat16(data.subarray(1, 3)), 3];
		}
		if (additionalInformation === 26) {
			// Float32
			if (data.byteLength < 4) {
				throw new CBORNotWellFormedError();
			}
			return [new CBORFloat32(data.subarray(1, 5)), 5];
		}
		if (additionalInformation === 27) {
			// Float64
			if (data.byteLength < 8) {
				throw new CBORNotWellFormedError();
			}
			return [new CBORFloat64(data.subarray(1, 9)), 9];
		}
		if (additionalInformation === 31) {
			return [new CBORBreak(), 1];
		}
		throw new CBORNotWellFormedError();
	}

	throw new CBORNotWellFormedError();
}

function getArgumentSize(additionalInformation: number): number {
	if (additionalInformation === 24) {
		return 1;
	} else if (additionalInformation === 25) {
		return 2;
	} else if (additionalInformation === 26) {
		return 4;
	} else if (additionalInformation === 27) {
		return 8;
	} else {
		throw new CBORNotWellFormedError();
	}
}

function getVariableUint(data: Uint8Array, size: number, offset: number): bigint {
	if (data.byteLength < size + offset) {
		throw new Error();
	}
	if (size === 1) {
		return BigInt(data[offset]);
	}
	if (size === 2) {
		return BigInt(bigEndian.uint16(data.subarray(offset, offset + size)));
	}
	if (size === 4) {
		return BigInt(bigEndian.uint32(data.subarray(offset, offset + size)));
	}
	if (size === 8) {
		return bigEndian.uint64(data.subarray(offset, offset + size));
	}
	throw new TypeError("Invalid size");
}
