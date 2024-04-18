/// #if __DEBUG__
/// #code let debugSignalCount = 0;
/// #endif

const MAX_POOL_SIZE = 100;
const NOOP = () => {};

const watchersPool = new Array(MAX_POOL_SIZE)
	.fill(null)
	.map(() => new SignalWatcher());

function SignalWatcher() {
	const self = this;
	this.fn = NOOP;
	this.once = false;
	this.disposable = true;
	this.ctx = this.signal = null;
	this.unwatch = function unwatch() {
		if (self.signal) self.signal.unwatch(self);
	};
}

function allocWatcher(fn, ctx, signal, once) {
	const watcher = watchersPool.pop() || new SignalWatcher();
	/// #if __DEBUG__
	/// #code debugSignalCount++;
	/// #endif
	watcher.fn = fn;
	watcher.ctx = ctx;
	watcher.signal = signal;
	watcher.once = once;
	watcher.disposable = false;
	return watcher;
}

function disposeWatcher(watcher) {
	if (!watcher || watcher.disposable) return;
	watcher.signal.needsCleanup = true;
	watcher.fn = NOOP;
	watcher.once = false;
	watcher.ctx = null;
	watcher.signal = null;
	watcher.disposable = true;
}

function freeWatcher(watcher) {
	/// #if __DEBUG__
	/// #code debugSignalCount--;
	/// #endif
	if (watchersPool.length < MAX_POOL_SIZE) {
		watchersPool.push(watcher);
	}
}

export class Signal {
	isSignal = true;
	needsCleanup = false;
	cleanupRequested = false;
	watchers = [];

	constructor() {
		const ctx = this;
		let cleanupRequested = false;
		const cleanup = function () {
			cleanupRequested = false;
			ctx.cleanup();
		};
		this.requestCleanup = function () {
			if (cleanupRequested) return;
			cleanupRequested = true;
			queueMicrotask(cleanup);
		};
	}

	emit(a0, a1 = null) {
		// Use emiting loop to also clean up disposed watchers
		const watchers = this.watchers;
		let j = 0;
		for (let i = 0; i < watchers.length; i++) {
			const watcher = watchers[ i ];
			const fn = watcher.fn;
			const ctx = watcher.ctx;
			if (watcher.disposable === true) continue;
			if (watcher.once) disposeWatcher(watcher);
			fn.call(ctx, a0, a1);
			// Compact disposed watchers to the left
			if (watcher.disposable === false) {
				if (i !== j) {
					const temp = watchers[ i ];
					watchers[ i ] = watchers[ j ];
					watchers[ j ] = temp;
				}
				j++;
			}
		}
		// Clean-up disposed watchers & re-compact the array
		if (j < watchers.length) {
			for (let i = j; i < watchers.length; i++) freeWatcher(watchers[ i ]);
			watchers.length = j;
			this.needsCleanup = false;
		}
	}

	cleanup() {
		if (!this.needsCleanup) return;
		this.needsCleanup = false;
		const watchers = this.watchers;
		let j = 0;
		for (let i = 0; i < watchers.length; i++) {
			const watcher = watchers[ i ];
			if (watcher.disposable === false) {
				if (i !== j) {
					const temp = watchers[ i ];
					watchers[ i ] = watchers[ j ];
					watchers[ j ] = temp;
				}
				j++;
			}
		}
		if (j < watchers.length) {
			for (let i = j; i < watchers.length; i++) {
				freeWatcher(watchers[ i ]);
			}
			watchers.length = j;
		}
	}

	watch(fn, ctx = this, once = false) {
		/// #if __DEBUG__
		/// #code if (typeof fn !== 'function') {
		/// #code throw new Error('Callback is not a function');
		/// #code }
		/// #endif
		const watcher = allocWatcher(fn, ctx, this, !!once);
		this.watchers.push(watcher);
		return watcher;
	}

	watchOnce(fn, ctx = this) {
		return this.watch(fn, ctx, true);
	}

	unwatch(fn, ctx = this) {
		if (fn instanceof SignalWatcher) {
			disposeWatcher(fn);
		} else {
			for (let i = 0; i < this.watchers.length; i++) {
				const watcher = this.watchers[ i ];
				if (watcher.fn === fn && watcher.ctx === ctx) {
					disposeWatcher(watcher);
				}
			}
		}
		if (this.needsCleanup) {
			this.requestCleanup();
		}
	}

	unwatchAll() {
		const watchers = this.watchers;
		let len = watchers.length;
		for (let i = 0; i < len; i++) {
			const watcher = watchers[ i ];
			disposeWatcher(watcher);
			freeWatcher(watcher);
		}
		watchers.length = 0;
	}
}

Signal.prototype.destroy = Signal.prototype.unwatchAll;

export const unwatchSignal = disposeWatcher;
export function signal() { return new Signal() }
