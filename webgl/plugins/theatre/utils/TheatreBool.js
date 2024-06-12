import { types } from '@theatre/core';

const NOOP = () => {};

export class TheatreBool {
	constructor(name, value = { value: false }, opts = {}, sheet) {
		this._name = name;
		this._value = value;
		this._sheet = sheet;

		this._isWritable = !!value.isWritableSignal;
		this._onUpdate = opts.onUpdate ?? NOOP;
		delete opts.onUpdate;

		const obj = sheet.instance.object(name, {
			value: types.boolean(value.value, opts),
		});
		this._object = obj;

		this._unwatch = obj.onValuesChange(this.update.bind(this));

		sheet.register(this);

		return this;
	}

	get name() {
		return this._name;
	}
	get value() {
		return this._value;
	}
	get sheet() {
		return this._sheet;
	}
	get object() {
		return this._object;
	}

	onChange(callback) {
		this._callback = callback;
		return this;
	}

	dispose() {
		this._unwatch?.();
		this._sheet.detach(this);
	}

	update({ value }) {
		if (this._isWritable) {
			this._value.set(value);
		} else {
			this._value.value = value;
		}

		this._onUpdate(value);
	}
}
