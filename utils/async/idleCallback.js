// Simple shim for requestIdleCallback

const def = { timeout: 500 };
const request = globalThis.requestIdleCallback || globalThis.requestAnimationFrame;
const cancel = globalThis.cancelIdleCallback || globalThis.cancelAnimationFrame;
const promise = opts => new Promise(r => request(r, Object.assign({}, def, opts)));

export const idleCallback = {
	request, cancel, promise
};
