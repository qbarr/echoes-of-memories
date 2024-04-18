import freezer from './signalFreezer.js';
import { Signal } from './signal.js';

export class Writable extends Signal {
	isWritableSignal = true;
	previous = null;
	value = null;

	constructor(initialValue) {
		super();
		this.value = initialValue;
	}

	get() {
		return this.value;
	}

	set(value, force = false) {
		if (!force && this.value === value) return;
		this.previous = this.value;
		this.value = value;
		if (freezer.isFrozen) freezer.stack.add(this);
		else super.emit(this.value, this.previous);
	}

	watchImmediate(fn, ctx) {
		const signal = this.watch(fn, ctx);
		fn.call(ctx, this.value, this.previous);
		return signal;
	}

	emit() {
		super.emit(this.value, this.previous);
	}

	update(cb, force = false) {
		this.set(cb(this.value) ?? this.value, force);
	}
}

export function writable(v) { return new Writable(v) }
