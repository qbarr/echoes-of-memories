const randomInt = (min, max) => Math.floor(Math.random() * (max - min)) + min;

export function randomArray(arr) {
	return arr[ randomInt(0, arr.length) ];
}

export function randomArrayExcept(arr, item) {
	const size = arr.length;
	if (size < 2) return arr[ 0 ];

	const index = arr.indexOf(item);
	const lastIndex = size - 1;

	if (index === -1) return randomArray(arr);
	else if (index === 0) return arr[ randomInt(1, size) ];
	else if (index === lastIndex) return arr[ randomInt(0, lastIndex) ];

	return Math.random() < (index / lastIndex)
		? arr[ randomInt(0, index) ]
		: arr[ randomInt(index + 1, size) ];
}
