import { types } from '@theatre/core';
import { Vector2, Vector3, Vector4 } from 'three';

const NOOP = () => {};

export class TheatreCompound {
	constructor(name, values = {}, opts = {}, sheet) {
		this._name = name;
		this._values = values;
		this._sheet = sheet;

		this._onUpdate = opts.onUpdate ?? NOOP;
		delete opts.onUpdate;

		const valuesKeys = Object.keys(values);
		this.childs = valuesKeys.reduce((acc, key) => {
			acc[key] = {};
			return acc;
		}, {});

		const obj = sheet.instance.object(name, {
			...valuesKeys.reduce((acc, key) => {
				acc[key] = createValue(
					key,
					values[key],
					{ ...opts, ...(values[key].opts ?? {}) },
					this.childs[key],
				);
				console.log('acc', acc);
				return acc;
			}, {}),
		});
		this._object = obj;

		this.childsKeys = Object.keys(this.childs);

		this._unwatch = obj.onValuesChange(this.update.bind(this));

		sheet.register(this);

		return this;
	}

	get name() {
		return this._name;
	}
	get values() {
		return this._values;
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

	update(values) {
		console.log(values);
		for (let i = 0; i < this.childsKeys.length; i++) {
			const key = this.childsKeys[i];
			const child = this.childs[key];
			if (child.isWritableSignal) {
				child.set(values[key]);
			} else {
				child.value = values[key];
			}
		}
		this._onUpdate(values);
	}
}

const simpleObjectVec2 = (id, value, opts = {}) => {
	return types.compound({
		x: types.number(value.x, opts),
		y: types.number(value.y, opts),
	});
};
const simpleObjectVec3 = (id, value, opts = {}) => {
	return types.compound({
		x: types.number(value.x, opts),
		y: types.number(value.y, opts),
		z: types.number(value.z, opts),
	});
};
const simpleObjectVec4 = (id, value, opts = {}) => {
	return types.compound({
		x: types.number(value.x, opts),
		y: types.number(value.y, opts),
		z: types.number(value.z, opts),
		w: types.number(value.w, opts),
	});
};

const simpleObjectVec = (id, value, opts = {}) => {
	if (value instanceof Vector2) {
		return simpleObjectVec2(id, value, opts);
	}
	if (value instanceof Vector3) {
		return simpleObjectVec3(id, value, opts);
	}
	if (value instanceof Vector4) {
		return simpleObjectVec4(id, value, opts);
	}
	return null;
};

const isInstanceOfVector = (v) =>
	v instanceof Vector2 || v instanceof Vector3 || v instanceof Vector4;

const getTypeFromValue = (value) => {
	let type = null;
	if (isInstanceOfVector(value)) {
		type = 'vec';
	}
	if (typeof value === 'boolean') {
		type = 'bool';
	}
	if (typeof value === 'number') {
		type = 'number';
	}
	if (typeof value === 'string') {
		type = 'string';
	}
	if (typeof value === 'function') {
		type = 'function';
	}
	return type;
};

const createValue = (id, value, opts, object) => {
	const v = value.value;
	const type = getTypeFromValue(v);

	if (isInstanceOfVector(v)) {
		const o = simpleObjectVec(id, v, opts);
		object[id] = value;
		return o;
	}

	if (typeof type === 'function') {
		const o = type(v, opts);
		object[id] = value;
		return o;
	} else if (typeof type === 'string') {
		let o = null;
		if (type === 'vec') {
			o = simpleObjectVec(id, v, opts);
			object[id] = v;
			return o;
		} else if (types[type]) {
			o = types[type](v, opts);
			object[id] = value;
			return o;
		} else if (type === 'boolean') {
			o = types.bool(v, opts);
			object[id] = value;
			return o;
		} else if (type === 'number') {
			o = types.number(v, opts);
			object[id] = value;
			return o;
		} else if (type === 'string') {
			o = types.string(v, opts);
			object[id] = value;
			return o;
		}
	} else {
		// Number by default
		const o = types.number(v, opts);
		object[id] = value;
		return o;
	}
};
