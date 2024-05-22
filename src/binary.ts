export class VariableSizeBuffer {
	private value: Uint8Array;
	public length = 0;
	public capacity = 0;

	constructor(initialSize: number) {
		this.value = new Uint8Array(initialSize);
	}

	public write(data: Uint8Array): void {
		if (this.length + data.byteLength <= this.capacity) {
			this.value.set(data, this.length);
			this.length += data.byteLength;
			return;
		}
		while (this.length + data.byteLength > this.capacity) {
			if (this.capacity === 0) {
				this.capacity = 1;
			} else {
				this.capacity = this.capacity * 2;
			}
		}
		const newValue = new Uint8Array(this.capacity);
		newValue.set(this.value.subarray(0, this.length));
		newValue.set(data, this.length);
		this.value = newValue;
		this.length += data.byteLength;
	}

	public read(target: Uint8Array): void {
		if (target.byteLength < this.length) {
			throw new TypeError("Not enough space");
		}
		target.set(this.value.subarray(0, this.length));
	}

	public bytes(): Uint8Array {
		return this.value.slice(0, this.length);
	}
}
