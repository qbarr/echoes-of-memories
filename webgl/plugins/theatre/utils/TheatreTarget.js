import { types } from '@theatre/core';
import { Object3D } from 'three';
import { TheatreBaseObject } from './TheatreBaseObject';

const NOOP = () => {};

// Essentially used for the camera
export class TheatreTarget extends TheatreBaseObject {
	constructor(name, value = new Object3D(), opts = {}, sheet) {
		super();

		this._name = name;
		this._value = value;
		this._initialValue = this._value;
		this._sheet = sheet;

		this._onUpdate = opts.onUpdate ?? NOOP;
		delete opts.onUpdate;

		opts.position = opts.position ?? {};
		opts.rotation = opts.rotation ?? {};

		const obj = sheet.instance.object(name, {
			position: types.compound({
				x: types.number(value.position.x, { ...opts, ...opts.position }),
				y: types.number(value.position.y, { ...opts, ...opts.position }),
				z: types.number(value.position.z, { ...opts, ...opts.position }),
			}),
			rotation: types.compound({
				x: types.number(value.rotation.x, { ...opts, ...opts.rotation }),
				y: types.number(value.rotation.y, { ...opts, ...opts.rotation }),
				z: types.number(value.rotation.z, { ...opts, ...opts.rotation }),
			}),
		});
		this._object = obj;

		// this._unwatch = obj.onValuesChange(this.update.bind(this));

		sheet.register(this);

		return this;
	}

	update({ position, rotation }) {
		const { x: px, y: py, z: pz } = position;
		const { x: rx, y: ry, z: rz } = rotation;

		this._value.position.set(px, py, pz);
		this._value.rotation.set(rx, ry, rz);

		this._onUpdate({ position, rotation });
	}
}
