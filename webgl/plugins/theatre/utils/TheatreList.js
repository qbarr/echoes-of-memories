import { onChange, types, val } from '@theatre/core';
import { TheatreBaseObject } from './TheatreBaseObject';

const NOOP = () => {};

export class TheatreList extends TheatreBaseObject {
	constructor(name, values = [], opts = {}, sheet) {
		super();

		this._name = name;
		this._values = values;
		this._initialValues = this._values;
		this._sheet = sheet;

		this._onUpdate = opts.onUpdate ?? NOOP;
		delete opts.onUpdate;

		const list = values.reduce((acc, v) => {
			acc[v] = v;
			return acc;
		}, {});
		list.__NONE__ = '__NONE__';

		const obj = sheet.object(name, {
			value: types.stringLiteral(list.__NONE__, list, {
				as: 'menu',
				label: name,
				...opts,
			}),
		});
		this._object = obj;

		sheet.register(this);

		return this;
	}

	get name() {
		return this._name;
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

	update({ value }) {
		const v = value === '__NONE__' ? null : value;
		this._onUpdate(v);
	}
}
