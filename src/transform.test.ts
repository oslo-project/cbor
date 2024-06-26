import { test, expect, describe } from "vitest";
import {
	CBORArray,
	CBORByteString,
	CBORFloat64,
	CBORMap,
	CBORNegativeInteger,
	CBORPositiveInteger,
	CBORSimple,
	CBORTagged,
	CBORTextString,
	CBORInvalidError
} from "./cbor.js";
import { transformCBORValueToNative } from "./transform.js";

describe("transformCBORValueIntoNative()", () => {
	test("transform", () => {
		const cbor = new CBORMap([
			[
				new CBORTextString(new TextEncoder().encode("text")),
				new CBORTextString(
					new TextEncoder().encode(
						"Have you been alright, through all those lonely lonely lonely lonely nights"
					)
				)
			],
			[
				new CBORTextString(new TextEncoder().encode("positive_int")),
				new CBORPositiveInteger(38684364984n)
			],
			[
				new CBORTextString(new TextEncoder().encode("negative_int")),
				new CBORNegativeInteger(-38684364984n)
			],
			[new CBORPositiveInteger(1n), new CBORPositiveInteger(1n)],
			[new CBORNegativeInteger(-1n), new CBORNegativeInteger(-1n)],
			[
				new CBORTextString(new TextEncoder().encode("float")),
				new CBORFloat64(new Uint8Array([0x40, 0x09, 0x21, 0xfb, 0x4d, 0x12, 0xd8, 0x4a]))
			],
			[
				new CBORTextString(new TextEncoder().encode("array")),
				new CBORArray([
					new CBORTextString(new TextEncoder().encode("hello")),
					new CBORPositiveInteger(543664n),
					new CBORMap([
						[
							new CBORTextString(new TextEncoder().encode("message")),
							new CBORTextString(new TextEncoder().encode("bye"))
						]
					])
				])
			],
			[
				new CBORTextString(new TextEncoder().encode("indefinite_array")),
				new CBORArray([
					new CBORTextString(new TextEncoder().encode("hello")),
					new CBORPositiveInteger(543664n),
					new CBORMap([
						[
							new CBORTextString(new TextEncoder().encode("message")),
							new CBORTextString(new TextEncoder().encode("bye"))
						]
					])
				])
			],
			[
				new CBORTextString(new TextEncoder().encode("indefinite_map")),
				new CBORMap([
					[
						new CBORTextString(new TextEncoder().encode("english")),
						new CBORTextString(new TextEncoder().encode("hello"))
					],
					[
						new CBORTextString(new TextEncoder().encode("japanese")),
						new CBORTextString(new TextEncoder().encode("こんにちは"))
					],
					[
						new CBORTextString(new TextEncoder().encode("french")),
						new CBORTextString(new TextEncoder().encode("bonjour"))
					],
					[
						new CBORTextString(new TextEncoder().encode("spanish")),
						new CBORTextString(new TextEncoder().encode("hola"))
					]
				])
			],
			[
				new CBORTextString(new TextEncoder().encode("tagged")),
				new CBORTagged(
					2n,
					new CBORByteString(
						new Uint8Array([
							0x30, 0xaf, 0xe2, 0xbf, 0x5e, 0xb8, 0x3b, 0x02, 0xa6, 0xc5, 0xe2, 0x01, 0xab
						])
					)
				)
			],
			[new CBORTextString(new TextEncoder().encode("false")), new CBORSimple(20)],
			[new CBORTextString(new TextEncoder().encode("true")), new CBORSimple(21)],
			[new CBORTextString(new TextEncoder().encode("null")), new CBORSimple(22)],
			[new CBORTextString(new TextEncoder().encode("undefined")), new CBORSimple(23)],
			[
				new CBORTextString(new TextEncoder().encode("byte_string")),
				new CBORByteString(new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05]))
			]
		]);

		expect(transformCBORValueToNative(cbor)).toStrictEqual({
			text: "Have you been alright, through all those lonely lonely lonely lonely nights",
			positive_int: 38684364984,
			negative_int: -38684364984,
			"1": 1,
			"-1": -1,
			array: [
				"hello",
				543664,
				{
					message: "bye"
				}
			],
			indefinite_array: [
				"hello",
				543664,
				{
					message: "bye"
				}
			],
			indefinite_map: {
				english: "hello",
				japanese: "こんにちは",
				french: "bonjour",
				spanish: "hola"
			},
			float: 3.1415926,
			true: true,
			false: false,
			null: null,
			undefined: undefined,
			byte_string: new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05]),
			tagged: new Uint8Array([
				0x30, 0xaf, 0xe2, 0xbf, 0x5e, 0xb8, 0x3b, 0x02, 0xa6, 0xc5, 0xe2, 0x01, 0xab
			])
		});
	});

	test("CBORInvalidError on invalid utf-8", () => {
		expect(() =>
			transformCBORValueToNative(new CBORTextString(new Uint8Array([0x80, 0x80])))
		).toThrowError(CBORInvalidError);
	});

	test("CBORInvalidError on duplicate keys", () => {
		expect(() =>
			transformCBORValueToNative(
				new CBORMap([
					[
						new CBORTextString(new TextEncoder().encode("message")),
						new CBORTextString(new TextEncoder().encode("hello"))
					],
					[
						new CBORTextString(new TextEncoder().encode("message")),
						new CBORTextString(new TextEncoder().encode("hello"))
					]
				])
			)
		).toThrowError(CBORInvalidError);
	});

	test("CBORInvalidError on __proto__ key", () => {
		expect(() =>
			transformCBORValueToNative(
				new CBORMap([
					[
						new CBORTextString(new TextEncoder().encode("__proto__")),
						new CBORTextString(new TextEncoder().encode("hello"))
					]
				])
			)
		).toThrowError(CBORInvalidError);
	});
});
