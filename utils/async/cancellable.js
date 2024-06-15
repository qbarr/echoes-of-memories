/**
 * @typedef CancellablePromise
 * @extends Promise
 * @property {Function} cancel Cancels the promise
 */

const CANCELLED = { isCancelled: true };
const MODES = { RETURN: 'return', THROW: 'throw', QUIET: 'quiet' };
const NOOP_FALSE = () => false;
/**
 * Executes a generator function and returns a cancellable promise.
 * @param {Function} fn Generator function
 * @param {'return'|'throw'|'quiet'}[mode='quiet'] Cancellation mode
 * @param {Function} [checkCancelled=()=>false] Function to check if the promise is cancelled
 * @returns {CancellablePromise} Cancellable promise
 */
function cancellable(fn, mode = MODES.QUIET, checkCancelled = NOOP_FALSE) {
	return (...args) => {
		let resolve; let reject; let isCancelled = false;
		const promise = new Promise((res, rej) => { resolve = res; reject = rej });
		const iter = fn.call(this, ...args);
		promise.cancel = () => isCancelled = true;
		(async () => {
			let _value = null;
			for (;;) {
				try {
					let res = iter.next(_value);
					if (res instanceof Promise) res = await res;
					let { done, value } = res;
					if (value instanceof Promise && !isCancelled) value = await value;
					if (checkCancelled()) isCancelled = true;
					if (!done && !isCancelled) { _value = value; continue }
					if (value !== CANCELLED && !isCancelled) return resolve(value);
					if (mode === MODES.RETURN) return resolve(CANCELLED);
					else if (mode === MODES.THROW) return reject(CANCELLED);
					else if (mode === MODES.QUIET) return;
				} catch (err) {
					reject(err);
				}
			}
		})();
		return promise;
	};
}
cancellable.MODES = MODES;
cancellable.CANCELLED = CANCELLED;

/**
 * Cancels the previous execution of a generator function when a new one is called.
 * @param {Function} genFn Generator function
 * @param {'return'|'throw'|'quiet'}[mode='quiet'] Cancellation mode
 * @returns {CancellablePromise} Cancellable promise
 */
function autoCancellable(genFn, mode = MODES.QUIET, checkCancelled = NOOP_FALSE) {
	const fn = cancellable(genFn, MODES.RETURN, checkCancelled);
	let lastExec = null;

	const flush = (exec, isError, resolve, reject, value) => {
		// Remove from memory the last execution
		if (exec === lastExec) lastExec = null;
		if (value === CANCELLED) {
			if (mode === MODES.RETURN) return resolve(CANCELLED);
			else if (mode === MODES.THROW) return reject(CANCELLED);
			else if (mode === MODES.QUIET) return;
		} else {
			return isError ? reject(value) : resolve(value);
		}
	};

	return (...args) => {
		if (lastExec) lastExec.cancel();
		const exec = lastExec = fn(...args);
		return new Promise((resolve, reject) => {
			exec.then(
				flush.bind(null, exec, false, resolve, reject),
				flush.bind(null, exec, true, resolve, reject)
			);
		});
	};
}
autoCancellable.MODES = MODES;
autoCancellable.CANCELLED = CANCELLED;

export {
	cancellable,
	autoCancellable
};
