import { types } from '@theatre/core';

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

export class TheatreGroup {
	constructor(name, values = [], opts = {}, sheet) {
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
		for (let i = 0; i < this.childsChildsKeys.length; i++) {
			const keys = this.childsChildsKeys[i];
			const parent = this.childsKeys[i];
			for (let j = 0; j < keys.length; j++) {
				const key = keys[j];
				const child = this.childs[parent][key];
				if (child.isWritableSignal) {
					child.set(values[parent][key]);
				} else {
					child.value = values[parent][key];
				}
			}
		}
		this._onUpdate(values);
	}
}

const createValue = (value, type, opts, id, object) => {
	const v = value.value;
	if (typeof type === 'function') {
		const o = type(v, opts);
		object[id] = value;
		return o;
	} else if (typeof type === 'string') {
		const o = types[type](v, opts);
		object[id] = value;
		return o;
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
