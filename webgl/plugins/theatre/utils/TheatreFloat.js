import { types } from '@theatre/core';
import { TheatreBaseObject } from './TheatreBaseObject';

const NOOP = () => {};

export class TheatreFloat extends TheatreBaseObject {
	constructor(name, value = { value: 0 }, opts = {}, sheet) {
		super();

		this._name = name;
		this._value = value;
		this._sheet = sheet;

		this._isWritable = !!value.isWritableSignal;
		this._onUpdate = opts.onUpdate ?? NOOP;
		delete opts.onUpdate;

		const obj = sheet.instance.object(name, {
			value: types.number(value.value, opts),
		});
		this._object = obj;

		// this._unwatch = obj.onValuesChange(this.update.bind(this));

		sheet.register(this);

		return this;
	}

	get value() {
		return this._value;
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
