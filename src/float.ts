export function toFloat16(data: Uint8Array): number {
	if (data.byteLength !== 2) {
		throw new TypeError();
	}
	const sign = (-1) ** (data[0] >> 7);
	let fraction = 0;
	fraction += 2 ** -1 * ((data[0] >> 1) & 0x01);
	fraction += 2 ** -2 * (data[0] & 0x01);
	for (let i = 0; i < 8; i++) {
		if (((data[1] >> (7 - i)) & 0x01) === 1) {
			fraction += 2 ** -(3 + i);
		}
	}
	const exponent = (data[0] >> 2) & 0x1f;
	if (exponent === 0) {
		return sign * 2 ** -14 * fraction;
	}
	if (exponent === 0x1f && fraction === 0) {
		return sign * Infinity;
	}
	if (exponent === 0x1f && fraction !== 0) {
		return NaN;
	}
	return sign * 2 ** (exponent - 15) * (1 + fraction);
}

export function toFloat32(data: Uint8Array): number {
	if (data.byteLength !== 4) {
		throw new TypeError();
	}

	const sign = (-1) ** (data[0] >> 7);
	const exponent = ((data[0] & 0x7f) << 1) + (data[1] >> 7);
	let fractionPart = data[1] & 0x7f;
	for (let i = 0; i < 3; i++) {
		fractionPart |= data[2 + i];
	}

	if (exponent === 0xff && fractionPart === 0) {
		return sign * Infinity;
	}
	if (exponent === 0xff && fractionPart !== 0) {
		return NaN;
	}

	let bias: number;
	let result: number;
	if (exponent === 0) {
		bias = 126;
		result = 0;
	} else {
		bias = 127;
		result = 2 ** (exponent - bias);
	}
	for (let i = 0; i < 7; i++) {
		if (((data[1] >> (6 - i)) & 0x01) === 1) {
			result += 2 ** (-1 - i + exponent - bias);
		}
	}
	for (let i = 0; i < 2; i++) {
		for (let j = 0; j < 8; j++) {
			if (((data[2 + i] >> (7 - j)) & 0x01) === 1) {
				const position = 8 + i * 8 + j;
				result += 2 ** (exponent - bias - position);
			}
		}
	}
	return sign * result;
}

export function toFloat64(data: Uint8Array): number {
	if (data.byteLength !== 8) {
		throw new TypeError();
	}

	const sign = (-1) ** (data[0] >> 7);
	const exponent = ((data[0] & 0x7f) << 4) + (data[1] >> 4);
	let fractionPart = data[1] & 0x0f;
	for (let i = 0; i < 6; i++) {
		fractionPart |= data[2 + i];
	}

	if (exponent === 0x7ff && fractionPart === 0) {
		return sign * Infinity;
	}
	if (exponent === 0x7ff && fractionPart !== 0) {
		return NaN;
	}

	let bias: number;
	let result: number;
	if (exponent === 0) {
		bias = 1022;
		result = 0;
	} else {
		bias = 1023;
		result = 2 ** (exponent - bias);
	}
	for (let i = 0; i < 4; i++) {
		if (((data[1] >> (3 - i)) & 0x01) === 1) {
			result += 2 ** (-1 - i + exponent - bias);
		}
	}
	for (let i = 0; i < 6; i++) {
		for (let j = 0; j < 8; j++) {
			if (((data[2 + i] >> (7 - j)) & 0x01) === 1) {
				const position = 5 + i * 8 + j;
				result += 2 ** (exponent - bias - position);
			}
		}
	}
	return sign * result;
}

export function putFloat64(target: Uint8Array, value: number): void {
	if (Number.isNaN(value)) {
		// qNaN
		target[0] = 0x7f;
		target[1] = 0xf8;
		target[2] = 0x00;
		target[3] = 0x00;
		target[4] = 0x00;
		target[5] = 0x00;
		target[6] = 0x00;
		target[7] = 0x01;
		return;
	}
	const view = new DataView(target.buffer);
	view.setFloat64(0, value, false);
}
