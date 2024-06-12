import { types } from '@theatre/core';
import { Object3D, Vector3 } from 'three';

const NOOP = () => {};

export class TheatreObject {
	constructor(name, value = new Object3D(), opts = {}, sheet) {
		this._name = name;
		this._value = value;
		this._sheet = sheet;

		this._onUpdate = opts.onUpdate ?? NOOP;
		delete opts.onUpdate;

		opts.position = opts.position ?? {};
		opts.rotation = opts.rotation ?? {};
		opts.scale = opts.scale ?? {};

		const obj = sheet.instance.object(name, {
			position: types.compound({
				x: types.number(value.x, { ...opts, ...opts.position }),
				y: types.number(value.y, { ...opts, ...opts.position }),
				z: types.number(value.z, { ...opts, ...opts.position }),
			}),
			rotation: types.compound({
				x: types.number(value.rotation.x, { ...opts, ...opts.rotation }),
				y: types.number(value.rotation.y, { ...opts, ...opts.rotation }),
				z: types.number(value.rotation.z, { ...opts, ...opts.rotation }),
			}),
			scale: types.compound({
				x: types.number(value.scale.x, { ...opts, ...opts.scale }),
				y: types.number(value.scale.y, { ...opts, ...opts.scale }),
				z: types.number(value.scale.z, { ...opts, ...opts.scale }),
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

	update({ rotation, position, scale }) {
		const { x: rx, y: ry, z: rz } = rotation;
		const { x: px, y: py, z: pz } = position;
		const { x: sx, y: sy, z: sz } = scale;

		this._value.rotation.set(rx, ry, rz);
		this._value.position.set(px, py, pz);
		this._value.scale.set(sx, sy, sz);

		this._onUpdate({ rotation, position, scale });
	}
}
