// Excelents sources:
// https://github.com/bryc/code/blob/master/jshash/hashes/README.md
// https://github.com/bryc/code/blob/master/jshash/PRNGs.md

const DEFAULT_SEED_STR = 'MM' + (Math.floor(Math.random() * 1e13) + Date.now());

// Lehmer-like PRNG - Ultra fast, but not very random
// Taken from https://github.com/borilla/fast-random/blob/master/index.js
export function lcgPrng(a) {
	if (typeof a === 'function') a = a();
	if ((a = (a | 0) % 2147483647) <= 0) a += 2147483646;
	return function lcgGen() {
		a = a * 48271 % 2147483647;
		return (a - 1) / 2147483646;
	};
}

// THIS IS THE DEFAULT PRNG :
// Mulberry32 PRNG - Very Fast, and pretty random - This is the default
// Taken from https://github.com/bryc/code/blob/master/jshash/PRNGs.md#mulberry32
export function mulberry32Prng(a) {
	if (typeof a === 'function') a = a();
	return function mulberry32Gen() {
		a |= 0; a = a + 0x6D2B79F5 | 0;
		let t = Math.imul(a ^ a >>> 15, 1 | a);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}

// Xoshiro128** PRNG - Medium fast, and very random
// Taken from https://github.com/bryc/code/blob/master/jshash/PRNGs.md#xoshiro
export function xoshiro128ssPrng(a, b, c, d) {
	if (typeof a === 'function') { a = a(); b = a(); c = a(); d = a() }
	return function xoshiro128ssGen() {
		let t = b << 9, r = a * 5; r = (r << 7 | r >>> 25) * 9;
		c = c ^ a; d = d ^ b; b = b ^ c; a = a ^ d; c = c ^ t;
		d = d << 11 | d >>> 21;
		return (r >>> 0) / 4294967296;
	};
}

// MurmurHash3's mixing function
// https://github.com/bryc/code/blob/master/jshash/PRNGs.md
export function xmur3Hash(str) {
	let h = 1779033703 ^ str.length;
	for (let i = 0; i < str.length; i++) {
		h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
		h = h << 13 | h >>> 19;
	}
	return function xmur3Gen() {
		h = Math.imul(h ^ h >>> 16, 2246822507);
		h = Math.imul(h ^ h >>> 13, 3266489909);
		return (h ^= h >>> 16) >>> 0;
	};
}

export function stringToSeed(str) {
	return xmur3Hash(str + '')();
}

export function stringToNumber(str) {
	return mulberry32Prng(xmur3Hash(str + '')())();
}

function createPrng(seedStr = DEFAULT_SEED_STR, generator = mulberry32Prng) {
	let nextFloat;
	setSeed(seedStr);

	return {
		setSeed,
		random, // [0, 1[
		randomFloat, // [min, max[
		randomInt, // [min, max]
		tossCoin, // true or false with a given probability
	};

	function setSeed(seedStr) {
		nextFloat = generator(xmur3Hash(seedStr + ''));
		nextFloat();
	}

	function random() {
		return nextFloat();
	}

	function tossCoin(probability = 0.5) {
		return nextFloat() < probability;
	}

	function randomFloat(min = 0, max = 1) {
		return nextFloat() * (max - min) + min;
	}

	function randomInt(min = 0, max = 100) {
		return Math.floor(nextFloat() * (max - min + 1)) + min;
	}
}

export const prng = createPrng(DEFAULT_SEED_STR);
prng.create = createPrng;
