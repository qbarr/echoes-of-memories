// Extraction of resolve / reject are made outside of the promise
// to avoid recreating a function each time the promise is created.
let resolve, reject;
const extractResolvers = (res, rej) => { resolve = res; reject = rej };

export function deferredPromise() {
	const promise = new Promise(extractResolvers);
	promise.resolve = resolve;
	promise.reject = reject;
	return promise;
}
