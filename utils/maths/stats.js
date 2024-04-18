export const mean = average;

export function average(values) {
	let val = 0;
	const len = values.length;
	for (let i = 0; i < len; i++) val += values[ i ];
	return val / len;
}

export function median(values = []) {
	const numbers = values.slice(0).sort((a, b) => a - b);
	const middle = Math.floor(numbers.length / 2);
	const isEven = numbers.length % 2 === 0;
	return isEven ? (numbers[ middle ] + numbers[ middle - 1 ]) / 2 : numbers[ middle ];
}

export function createMovingAverage(maxSize = 6) {
	const buffer = new Float64Array(maxSize);
	const api = { value: 0, push, reset };
	let size, sum, index;
	size = sum = index = 0;
	return api;

	function push(value) {
		if (size < maxSize) size++;
		index = (index + 1) % maxSize;
		const prevValue = buffer[ index ];
		buffer[ index ] = value;
		sum += value - prevValue;
		return api.value = sum / size;
	}

	function reset() {
		size = sum = index = 0;
		for (let i = 0; i < maxSize; i++) buffer[ i ] = 0;
	}
}
