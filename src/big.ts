export function toBigIntBigEndian(bytes: Uint8Array): bigint {
	let result = 0n;
	for (let i = 0; i < bytes.byteLength; i++) {
		result += BigInt(bytes[i]) << (BigInt(bytes.byteLength - 1 - i) * 8n);
	}
	return result;
}
