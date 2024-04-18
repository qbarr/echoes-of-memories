const PI2 = Math.PI * 2;

// --- smoothstep ---
export function smoothstep(min, max, value) {
	const x = clamp((value - min) / (max - min), 0, 1);
	return x * x * (3 - 2 * x);
}

// ------ map -------
export function clamp(value, min = 0, max = 1) {
	return Math.min(Math.max(value, min), max);
}
export function map(value, start1, stop1, start2, stop2) {
	return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}
export function clampedMap(value, start1, stop1, start2, stop2) {
	const v = start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
	let min = start2;
	let max = stop2;
	if (start2 > stop2) { min = stop2; max = start2 }
	return Math.max(min, Math.min(max, v));
}
export function norm(value, min = 0, max = 1) {
	return (value - min) / (max - min);
}
export function clampedNorm(value, min = 0, max = 1) {
	return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

// ------ lerp -------
export const mix = lerp;
export const mixPrecise = lerpPrecise;
export function lerp(start, end, t) {
	return start * (1 - t) + end * t;
}
export function lerpPrecise(start, end, t, limit = 0.001) {
	const v = start * (1 - t) + end * t;
	return Math.abs(end - v) < limit ? end : v;
}
export function damp(a, b, smoothing, dt) {
	return lerp(a, b, 1 - Math.exp(-smoothing * 0.05 * dt));
}
export function dampPrecise(a, b, smoothing, dt, limit) {
	return lerpPrecise(a, b, 1 - Math.exp(-smoothing * 0.05 * dt), limit);
}
function shortAngleDist(a0, a1) {
	let da = (a1 - a0) % PI2;
	return 2 * da % PI2 - da;
}
export function lerpAngle(a0, a1, t) {
	return a0 + shortAngleDist(a0, a1) * t;
}

// Linear interpolation between multiple values in an array,
// This is kind of a js version of the scss `fluidSize` mixin
export function valuesMapper(arr) {
	const [ minIn, minOut ] = arr[ 0 ];
	const [ maxIn, maxOut ] = arr[ arr.length - 1 ];
	let len = arr.length;
	let lastValue = null;
	let lastReturn = 0;
	let lastBound = -1;

	return function valuesMap(current) {
		if (lastValue === current) return lastReturn;
		lastValue = current;
		if (current <= minIn) return (lastBound = 0, lastReturn = minOut);
		if (current >= maxIn) return (lastBound = len - 1, lastReturn = maxOut);
		for (let i = (lastBound !== -1 ? -1 : 0); i < len; i++) {
			let idx = i === -1 ? lastBound : i;
			const bound = arr[ idx ];
			const nextBound = arr[ idx + 1 ];
			if (current >= bound[ 0 ] && current < nextBound[ 0 ]) {
				lastBound = idx;
				return (lastReturn = map(
					current,
					bound[ 0 ],
					nextBound[ 0 ],
					bound[ 1 ],
					nextBound[ 1 ]
				));
			}
		}
	};
}
