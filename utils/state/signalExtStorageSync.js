import { writable } from './signalWritable.js';
import { serializers } from '../misc/serializers.js';

const IS_BROWSER = typeof window !== 'undefined';

export function storageSync(key, signal, opts = {}) {
	if (key == null) return;
	if (opts.storage == null) opts.storage = localStorage;
	if (!signal.isWritableSignal) signal = writable(signal);

	const defValue = signal.value;
	const { serialize, unserialize } = serializers.select(defValue, opts);

	if (IS_BROWSER) {
		const storage = opts.storage;
		const v = storage.getItem(key);
		signal.value = v ? unserialize(v, defValue) : defValue;
		const immediate = v == null || signal.value !== defValue;
		signal[ immediate ? 'watchImmediate' : 'watch' ](v => {
			if (v === null) storage.removeItem(key);
			else storage.setItem(key, serialize(v, defValue));
		});
	}

	return signal;
}
