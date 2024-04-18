export function asyncLimiter(cb, count, ctx) {
	let currentCount = 0;
	let queued = [];

	return async function limitAsync(a, b, c, d) {
		if (currentCount > count) await new Promise(r => queued.push(r));
		currentCount++;
		const res = await cb.call(ctx, a, b, c, d);
		currentCount--;
		if (currentCount <= count && queued.length) queued.shift()();
		return res;
	};
}
