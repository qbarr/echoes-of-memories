import { TheatreBaseObject } from './TheatreBaseObject';
import { types } from '@theatre/core';
import { Vector2, Vector3, Vector4 } from 'three';
import { log } from 'three/examples/jsm/nodes/Nodes.js';

const NOOP = () => {};

export class TheatreCompound extends TheatreBaseObject {
	constructor(name, values = {}, opts = {}, sheet) {
		super();
		this._name = name;
		this._values = values;
		this._initialValues = this._values;
		this._sheet = sheet;

		this._onUpdate = opts.onUpdate ?? NOOP;
		delete opts.onUpdate;

		const valuesKeys = Object.keys(values);
		this.childs = {};

		const obj = sheet.instance.object(name, {
			...valuesKeys.reduce((acc, key) => {
				acc[key] = createValue(
					key,
					values[key],
					{ ...opts, ...(opts[key] ?? {}) },
					this.childs,
				);
				return acc;
			}, {}),
		});
		this._object = obj;

		this.childsKeys = Object.keys(this.childs);

		// this._unwatch = obj.onValuesChange(this.update.bind(this));

		sheet.register(this);

		return this;
	}

	setInitialValues(values) {
		this.update(values);
	}

	update(values) {
		for (let i = 0; i < this.childsKeys.length; i++) {
			const key = this.childsKeys[i];
			const child = this.childs[key];
			const v = this._values[key];
			if (child.isWritableSignal) {
				if (child.isVector) v.set(v.copy(values[key]));
				else v.set(values[key]);
			} else {
				if (child.isVector) v.value.copy(values[key]);
				else v.value = values[key];
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
		type = 'boolean';
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
	const v = value.value ?? value;
	const type = getTypeFromValue(v);

	if (isInstanceOfVector(v)) {
		const o = simpleObjectVec(id, v, opts);
		object[id] = v;
		object[id].isVector = true;
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
			object[id].isVector = true;
			return o;
		} else if (types[type]) {
			o = types[type](v, opts);
			object[id] = value;
			return o;
		} else if (type === 'boolean') {
			o = types.boolean(v, opts);
			object[id] = value;
			return o;
		}
	} else {
		// Number by default
		const o = types.number(v ?? value, opts);
		object[id] = value;
		return o;
	}
};
