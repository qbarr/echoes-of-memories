import { types } from '@theatre/core';
import { Object3D, Vector3 } from 'three';
import { TheatreBaseObject } from './TheatreBaseObject';

const NOOP = () => {};

export class TheatreObject extends TheatreBaseObject {
	constructor(name, value = { value: new Object3D() }, opts = {}, sheet) {
		super();

		this._name = name;
		this._value = value.value;
		this._sheet = sheet;

		this._onUpdate = opts.onUpdate ?? NOOP;
		delete opts.onUpdate;

		opts.position = opts.position ?? {};
		opts.rotation = opts.rotation ?? {};
		opts.scale = opts.scale ?? {};

		const { position, rotation, scale } = this._value;
		const obj = sheet.instance.object(name, {
			position: types.compound({
				x: types.number(position.x, { ...opts, ...opts.position }),
				y: types.number(position.y, { ...opts, ...opts.position }),
				z: types.number(position.z, { ...opts, ...opts.position }),
			}),
			rotation: types.compound({
				x: types.number(rotation.x, { ...opts, ...opts.rotation }),
				y: types.number(rotation.y, { ...opts, ...opts.rotation }),
				z: types.number(rotation.z, { ...opts, ...opts.rotation }),
			}),
			scale: types.compound({
				x: types.number(scale.x, { ...opts, ...opts.scale }),
				y: types.number(scale.y, { ...opts, ...opts.scale }),
				z: types.number(scale.z, { ...opts, ...opts.scale }),
			}),
		});
		this._object = obj;

		// this._unwatch = obj.onValuesChange(this.update.bind(this));

		sheet.register(this);

		return this;
	}

	get value() {
		return this._value;
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
