import {
	markRaw,
	onBeforeUnmount,
	shallowRef,
	watch,
	customRef,
	ref,
	getCurrentInstance,
	isRef,
	toRaw,
	isReactive,
	isShallow
} from 'vue';

import { serializers } from '#utils/misc';

const NOOP = v => v;
const IS_BROWSER = typeof window !== 'undefined';

// Convert a store signal commonly used
// in our webgl workflow into a vue ref
// This is a two-way binding so you can update store signal from the vue ref
export function signalRef(signal) {
	markRaw(signal);
	let triggerFn = NOOP;
	const sref = customRef((track, trigger) => {
		triggerFn = trigger;
		return {
			get() { track(); return signal.value },
			set(v) { signal.set(v) }
		};
	});
	signal.watch(triggerFn);
	onBeforeUnmount(() => signal.unwatch(triggerFn));
	return sref;
}

export function delayedBoolean(source, delayFalse = 0, delayTrue = 100) {
	const r = shallowRef(typeof source === 'function' ? source() : source);
	const setTrue = () => r.value = true;
	const setFalse = () => r.value = false;
	let timer;
	const unwatch = watch(source, v => {
		clearTimeout(timer);
		if (v) {
			if (delayTrue > 0) timer = setTimeout(setTrue, delayTrue);
			else setTrue();
		} else {
			if (delayFalse > 0) timer = setTimeout(setFalse, delayFalse);
			else setFalse();
		}
	});
	return [ r, unwatch ];
}

export function watchUntilTrue(r, cb, opts) {
	let isImmediateRun = true;
	let needsUnwatch = false;
	const unwatch = watch(r, (a, b, c) => {
		const v = cb(a, b, c);
		if (v !== true) return;
		if (isImmediateRun) return needsUnwatch = true;
		if (needsUnwatch) needsUnwatch = false;
		unwatch();
	}, opts);
	isImmediateRun = false;
	if (needsUnwatch) unwatch();
	return unwatch;
}

export function isRefOrReactive(v) {
	return isRef(v) || isReactive(v);
}

export function toRawValue(v) {
	if (!isRefOrReactive(v)) return v;
	return isRef(v) ? toRaw(v.value) : toRaw(v);
}

// Serializers for useStorage
export function useStorage(key, defValue = null, opts = {}) {
	if (!opts.storage) opts.storage = localStorage;

	// Ensure we have a ref
	const sref = isRefOrReactive(defValue) ? defValue : ref(defValue);

	// Extract default value to deduce default type
	let rawDefValue = toRawValue(sref);

	const { serialize, unserialize } = serializers.select(rawDefValue, opts);

	let unwatchCb;
	let unwatched = false;

	function unwatch(a, b) {
		if (unwatched) return;
		unwatched = true;
		if (unwatchCb) unwatchCb(a, b);
	}

	function init(v, prevDef) {
		const storage = opts.storage;
		let hasChanged = false;
		if (prevDef != null) {
			rawDefValue = toRawValue(sref);
			const rawDef = JSON.stringify(rawDefValue);
			hasChanged = rawDef !== prevDef;
		}
		const storedValue = v ? unserialize(v, rawDefValue) : rawDefValue;
		if (!hasChanged) sref.value = storedValue;
		const immediate = v == null || (!hasChanged && sref.value !== rawDefValue);
		unwatchCb = watch(sref, v => {
			if (v == null) storage.removeItem(key);
			else storage.setItem(key, serialize(toRaw(v), rawDefValue));
		}, { immediate, deep: !isShallow(sref) });
	}

	if (IS_BROWSER) {
		const storage = opts.storage;
		const v = storage.getItem(key);
		if (v && v.then) {
			const prevDef = JSON.stringify(rawDefValue);
			v.then(v => init(v, prevDef)).catch(console.error);
		} else {
			init(v);
		}
		// use onBeforeUnmounted if available
		if (getCurrentInstance()) onBeforeUnmount(unwatch);
	}

	// Remove temp vars
	defValue = rawDefValue = null;
	return opts.returnUnwatch ? [ sref, unwatch ] : sref;
}


export function throttledRef(value, delay = 100) {
	let canChange = true;
	const reset = () => canChange = true;
	return customRef((track, trigger) => {
		return {
			get() { track(); return value },
			set(v) {
				if (value === v || !canChange) return;
				canChange = false;
				value = v;
				trigger();
				setTimeout(reset, delay);
			}
		};
	});
}
