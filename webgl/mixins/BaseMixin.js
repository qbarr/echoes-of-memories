import { getWebGL } from '#webgl/core';

export default class BaseMixin {
	constructor(opts = {}) {
		this.isMixin = true;
		this.isCreated = false;
		this.isDestroyed = false;
		this.options = opts;
		this.base = null;
		this.webgl = getWebGL();
	}

	/**
	 * Called once when the mixin is initialized
	 */
	created() {}

	/**
	 * Called on the component use the mixin
	 */
	used() {}

	/**
	 * Called when the component unuse the mixin
	 */
	unused() {}

	/**
	 * Called once when the mixin or the component is destroyed
	 */
	destroyed() {}

	componentAttached() {}
	componentDetached() {}

	use(el) {
		// Mixin already used or destroyed - return
		if (this.isDestroyed || this.base === el) return;

		this.base = el;
		const mixins = el.usedMixins;

		// Avoid using mixin on another element
		if (this.uid && el.uid !== this.uid) return;
		this.uid = el.uid;

		if (!this.isCreated) {
			this.static = this.static != null ? this.static : !this.update;
			this.isCreated = true;
			this.created(el, this.options);
		}

		mixins.push(this);
		if (!this.static) mixins.dynamic.push(this);
		this.used(el);
	}

	unuse() {
		if (this.isDestroyed || !this.base) return;
		this.unused(this.base);
		let index;
		index = this.base.usedMixins.indexOf(this);
		if (index >= 0) this.base.usedMixins.splice(index, 1);
		index = this.base.usedMixins.dynamic.indexOf(this);
		if (index >= 0) this.base.usedMixins.dynamic.splice(index, 1);
		this.base = null;
	}

	destroy() {
		if (this.isDestroyed) return;
		const base = this.base;
		this.unuse();
		this.base = base;
		this.destroyed();
		this.base = null;
		this.isDestroyed = true;
		this.options = null;
		this.webgl = null;
	}

	extendProto(name, fn, force) {
		const proto = this.base.constructor.prototype;
		if (!force && proto[ name ]) return;
		proto[ name ] = fn;
	}
}
