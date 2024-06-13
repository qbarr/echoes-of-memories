import { types } from '@theatre/core';

const NOOP = () => {};

export class TheatreBaseObject {
	get name() {
		return this._name;
	}
	get sheet() {
		return this._sheet;
	}
	get object() {
		return this._object;
	}

	onChange(callback) {
		this._onUpdate = callback;
		return this;
	}

	dispose() {
		this._unwatch?.();
		this.sheet.detach(this);
	}

	listen(callback) {
		if (!this.object) return __DEBUG__ && console.warn('No object to listen to');
		this._unwatch = this.object.onValuesChange(this.update.bind(this));
		return this;
	}

	unlisten() {
		this._unwatch?.();
		return this;
	}

	update() {}
}
