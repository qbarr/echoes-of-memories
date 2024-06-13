import { types } from '@theatre/core';
import { Vector2, Vector3, Vector4 } from 'three';
import { TheatreBaseObject } from './TheatreBaseObject';

const NOOP = () => {};

/*

const dummy = { value: 0 };
const dummy2 = { value: 0 };

introSheet
	.$group('group', [
		{
			id: 'test',
			child: {
				dummy: {
					value: dummy,
					range: [0, 2],
				},
			},
		},
		{
			id: 'test2',
			child: {
				dummy: {
					value: dummy2,
					range: [0, 2],
				},
			},
		},
	])
	.onChange((v) => {
		console.log(v);
	});
*/

export class TheatreGroup extends TheatreBaseObject {
	constructor(name, values = [], opts = {}, sheet) {
		super();

		this._name = name;
		this._values = values;
		this._sheet = sheet;

		this._onUpdate = opts.onUpdate ?? NOOP;
		delete opts.onUpdate;

		this.childs = values.reduce((acc, { id }) => {
			acc[id] = {};
			return acc;
		}, {});

		const obj = sheet.instance.object(name, {
			...values.reduce((acc, { id, child }) => {
				acc[id] = types.compound(createChilds(child, this.childs[id]));
				return acc;
			}, {}),
		});
		this._object = obj;

		// Oui c'est cheum mais nsmmmm
		this.childsKeys = Object.keys(this.childs);
		this.childsChildsKeys = this.childsKeys.map((key) =>
			Object.keys(this.childs[key]),
		);

		// this._unwatch = obj.onValuesChange(this.update.bind(this));

		sheet.register(this);

		return this;
	}

	get values() {
		return this._values;
	}

	update(values) {
		for (let i = 0; i < this.childsChildsKeys.length; i++) {
			const keys = this.childsChildsKeys[i];
			const parent = this.childsKeys[i];
			for (let j = 0; j < keys.length; j++) {
				const key = keys[j];
				const child = this.childs[parent][key];
				let v = this._values[i].child[key];
				if (v.value.value !== null && !child.isWritableSignal) v = v.value;
				if (child.isWritableSignal) {
					if (child.isVector) v.value.set(v.value.copy(values[parent][key]));
					else v.value.set(values[parent][key]);
				} else {
					if (child.isVector) v.value.copy(values[parent][key]);
					else v.value = values[parent][key];
					console.log('update', v.value)
				}
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

const createValue = (value, type, opts, id, object) => {
	const v = value.value;

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
		if (type === 'compound') {
			o = simpleObjectVec(id, v, opts);
			object[id] = v;
			object[id].isVector = true;
			return o;
		} else {
			o = types[type](v, opts);
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

const createChild = (_child, id, object) => {
	const { value, child = null, type = null, ...opts } = _child;
	return createValue(value, type, opts, id, object);
};

const createChilds = (childs, object) => {
	return Object.keys(childs).reduce((acc, key) => {
		acc[key] = createChild(childs[key], key, object);
		return acc;
	}, {});
};
