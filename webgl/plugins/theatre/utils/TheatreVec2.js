import { types } from '@theatre/core';
import { Vector2 } from 'three';

const NOOP = () => {};

export class TheatreVec2 {
	constructor(name, value = new Vector2(), opts = {}, sheet) {
		this._name = name;
		this._value = value;
		this._sheet = sheet;

		this._isWritable = !!value.isWritableSignal;
		this._onUpdate = opts.onUpdate ?? NOOP;
		delete opts.onUpdate;

		const v = this._isWritable ? value.value : value;
		console.log(value, v);
		const obj = sheet.instance.object(name, {
			value: types.compound({
				x: types.number(v.x, opts),
				y: types.number(v.y, opts),
			}),
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

	dispose() {
		this._unwatch?.();
		this._sheet.detach(this);
	}

	onChange(callback) {
		this._callback = callback;
		return this;
	}

	update({ value }) {
		if (this._isWritable) {
			this._value.set(value);
		} else {
			this._value.set(value.x, value.y);
		}

		this._onUpdate(value);
	}
}