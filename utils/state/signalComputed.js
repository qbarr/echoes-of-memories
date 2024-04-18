import { microdefer } from '../async/microdefer.js';
import { Writable } from './signalWritable.js';

const NOOP = () => {};

export function computed(observables = [], cb = NOOP, sync = false) {
	const computedSignal = new Writable();

	const ogSet = computedSignal.set.bind(computedSignal);
	computedSignal.set = NOOP;
	computedSignal.update = NOOP;
	computedSignal.destroy = destroy;

	observables = Array.isArray(observables) ? observables : [ observables ];
	const values = new Array(observables.length);
	const listeners = new Array(observables.length);

	// By default, computed is only re-evaluated on the next microtask
	const callRecompute = sync ? recompute : microdefer(recompute);

	for (let i = 0, l = observables.length; i < l; i++) {
		const signal = observables[ i ];
		values[ i ] = signal.value;
		listeners[ i ] = signal.watch(v => {
			values[ i ] = v;
			callRecompute();
		});
	}

	function recompute() {
		const result = cb.apply(null, values);
		ogSet(result);
	}

	function destroy() {
		for (let i = 0, l = listeners.length; i < l; i++) {
			listeners[ i ].unwatch();
		}

		listeners.length = 0;
		computedSignal.unwatchAll();
	}

	recompute();
	return computedSignal;
}
