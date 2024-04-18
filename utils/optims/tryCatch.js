export function tryCatch(fn) {
	try {
		return fn();
	} catch (e) {
		if (!(e instanceof Error)) {
			return new Error(e);
		} else {
			return e;
		}
	}
}

export async function tryCatchAsync(fn, args, ctx) {
	try {
		return await fn.apply(ctx, args);
	} catch (e) {
		return { error: e || true };
	}
}
