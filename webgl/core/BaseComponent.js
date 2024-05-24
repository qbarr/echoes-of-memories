import { fastBind } from '#utils/optims';
import { createLogger } from '#utils/debug';
import { getWebGL } from '.';

/**
 * @typedef {import('../mixins/BaseMixin')} BaseMixin
 */

let USE_DEBUG = typeof __DEBUG__ !== 'undefined' && __DEBUG__;

if (USE_DEBUG) {
	window.debugWebglComponentCount = window.debugWebglComponentCount || 0;
}

const StringType = 'string';
const nameCounts = {};
let uid = 0;

// TODO: benchmark linkedList usage instead of array for children & mixins
export default class BaseComponent {
	constructor(props = {}) {
		this.isComponent = true;
		this.props = props;

		const m = this.usedMixins = [];
		m.dynamic = [];

		this.static = false;

		this.webgl = getWebGL();
		this.scene = null;
		this.parent = null;
		this.base = null;

		const c = this.children = [];
		c.dynamic = [];

		this.isInit = false;
		this.isDestroyed = false;

		this.uid = ++uid;

		if (!this.name) {
			if (this.props.name) {
				this.name = this.props.name;
			} else if (this.props.id) {
				this.name = this.props.id;
			} else {
				this.name = this.constructor.name;
				if (!nameCounts[ this.name ]) nameCounts[ this.name ] = 1;
				else ++nameCounts[ this.name ];
				if (nameCounts[ this.name ] > 1) {
					this.name += '_' + (nameCounts[ this.name ] - 1);
				}
			}
		}

		if (USE_DEBUG) {
			this.guiItems = new Set();
			window.debugWebglComponentCount++;
		}

		if (USE_DEBUG) {
			this.log = createLogger('GL.' + this.name, '#000', '#5cb182').log;
		} else {
			this.log = () => {};
		}
	}

	// Lifecycle
	// init
	// DEV - devtools
	// attached
	// update
	// afterUpdate
	// detached
	// beforeDestroy

	/**
	 * Trigger init call stack
	 */
	triggerInit() {
		if (this.isInit) return;
		if (this.beforeInit) this.beforeInit();
		if (this.mixins) {
			const mixins = this.mixins;
			if (Array.isArray(mixins)) {
				for (let i = 0; i < mixins.length; i++) {
					let mixin = mixins[ i ];
					let opts;
					if (Array.isArray(mixin)) {
						opts = mixin[ 1 ];
						mixin = mixin[ 0 ];
					}
					this.useMixin(mixin, opts);
				}
			}
		}
		if (this.init) this.init();
		this.isInit = true;
		if (this.afterInit) this.afterInit();
		if (USE_DEBUG) this.devtools && this.devtools();
	}


	/**
	 * Easily bind a method to the current instance context
	 * @param {string} method - Method name to bind to current instance
	 * @param {int} argCount - Number of arguments
	 * @returns {function} Bound function
	 */
	bind(method, argCount = 0) {
		this[ method ] = fastBind(method, this, argCount);
		return this[ method ];
	}

	/**
	 * Use a mixin with this component.
	 * Will instanciate the mixin if you pass a class.
	 * (A mixin is like a modulable component behavior.)
	 * @param {BaseMixin} mixin - Mixin to append to the component
	 * @param {obj} obj - Set of option to instanciate the mixin with
	 * @returns {BaseMixin} The component mixin
	 */
	useMixin(mixin, opts) {
		if (typeof mixin === StringType) {
			mixin = this.webgl.mixins[ mixin ];
			if (Array.isArray(mixin)) {
				opts = Object.assign({}, mixin[ 1 ], opts);
				mixin = mixin[ 0 ];
			}
		}

		if (!mixin) return;
		(mixin.isMixin ? mixin : new mixin(opts ?? {})).use(this);
	}

	/**
	 * Add a mixin to the component. (a mixin is a modulable component behavior)
	 * @param {BaseMixin} mixin - Mixin to append to the component
	 */
	unuseMixin(mixin) {
		if (!mixin) return;
		mixin.unuse();
	}

	/**
	 * Add a simple three object to the base object of the component
	 * @param {THREE.Object3D} object - Base object to append to the component
	 * @returns {THREE.Object3D} Append object
	 */
	addObject3D(object) {
		if (this.base) this.base.add(object);
		return object;
	}

	/**
	 * Remove a three object from the component bast object
	 * @param {THREE.Object3D} object - Base object to remove
	 */
	removeObject3D(object) {
		if (this.base) this.base.remove(object);
		return null;
	}

	/**
	 * Add a base component to the component children
	 * @param {BaseComponent} component - BaseComponent to add (instance or class)
	 * @param props - child props (used if you pass a component class)
	 * @returns {BaseComponent} Instancied child
	 */
	add(child, props = {}, mountTo) {
		if (!child) return;

		// Don't add child already added
		if (~this.children.indexOf(child)) return child;

		// Instanciate child if a class is passed
		if (!child.isComponent) {
			child = new child(props);
		} else {
			// mountTo = props;
			props = child.props;
		}

		// If the child already has a parent, remove it
		// Do not trigger detached hook
		const currentParent = child.parent;
		if (currentParent) currentParent.remove(child);

		// Assign parent
		child.parent = this;

		// Pass scene early on to access to scene easily during init
		if (this.scene) child.scene = this.scene;
		else if (this.isScene) child.scene = this;
		// Do we need to remove scene after init to avoid leak?

		// Init component AFTER instanciation
		if (!child.isInit) child.triggerInit(props);

		// Static child will not be updated in the update loop
		if (!child.static) this.children.dynamic.push(child);
		this.children.push(child);

		// Mount three object
		if (child.base) {
			if (mountTo) mountTo.add(child.base);
			else if (this.base) this.base.add(child.base);
		}

		// Remove child, in case it was destroyed from init pipeline
		if (child.destroyed) {
			this.remove(child);
			return child;
		}

		// Trigger attached() in cascade
		// If current component is already mounted in a scene
		// Or if current component IS a scene
		if (this.isAttached) triggerAttached(this.scene, child);
		return child;
	}

	/**
	 * Remove the component from its parent
	 */
	removeFromParent() {
		if (this.parent) this.parent.remove(this);
	}

	/**
	 * Remove a component child from the component children
	 * @param {BaseComponent} child - Child component to remove
	 */
	remove(child) {
		// Remove from children list
		const index = this.children.indexOf(child);
		if (!~index) return;
		this.children.splice(index, 1);

		// Remove from dynamic childs list
		const dynIndex = this.children.dynamic.indexOf(child);
		if (~dynIndex) this.children.dynamic.splice(dynIndex, 1);

		// Remove parenting reference
		child.parent = null;

		// Unmount three object
		if (child.base) child.base.removeFromParent();

		// Trigger detached() in cascade
		triggerDetached(child);
		return null;
	}

	/**
	 * Trigger an update call stack
	 */
	triggerUpdate() {
		if (!this.isInit) return;
		if (this.beforeUpdate) this.beforeUpdate();

		// Update mixins
		const mixins = this.usedMixins.dynamic;
		for (let i = 0, l = mixins.length; i < l; i++) {
			const mixin = mixins[ i ];
			if (mixin) mixin.update();
			if (this.isDestroyed) break;
			// Dirty - adjust loop if the item is destroyed during update
			if (mixin.isDestroyed) { l--; i-- }
		}

		if (this.isDestroyed) return; // Needed in case a mixin destroys the component
		if (this.update) this.update();

		// Update childrens
		if (this.isDestroyed) return; // Needed in case update destroys the component
		const children = this.children.dynamic;
		for (let i = 0, l = children.length; i < l; i++) {
			const child = children[ i ];
			if (child) child.triggerUpdate();
			if (!child) continue;
			// Dirty - adjust loop if the item is destroyed during update
			if (child.isDestroyed) { l--; i-- }
		}

		// Needed in case children destroys the component
		if (this.isDestroyed) return;
		if (this.afterUpdate) this.afterUpdate();
	}

	/**
	 * Destroy the component. Cannot be used afterward.
	 */
	destroy() {
		if (this.isDestroyed) return;

		// Start beforeDestroy hook
		if (this.beforeDestroy) this.beforeDestroy();

		// Destroy mixins
		for (let i = this.usedMixins.length - 1; i >= 0; i--) {
			this.usedMixins[ i ].destroy();
		}

		// Remove from parent
		if (this.parent) this.parent.remove(this);

		// Destroy each children components
		for (let i = this.children.length - 1; i >= 0; i--) {
			this.children[ i ].destroy();
		}

		// Remove three object
		if (this.base) {
			for (let i = this.base.children.length - 1; i >= 0; i--) {
				this.base.remove(this.base.children[ i ]);
			}
			this.base.removeFromParent();
		}

		// De-reference variables
		this.props = null;
		this.usedMixins = null;
		this.webgl = null;
		this.scene = null;
		this.parent = null;
		this.base = null;
		this.children = null;
		this.isDestroyed = true;

		if (USE_DEBUG && this.guiItems) {
			this.guiItems.forEach(v => v.dispose && v.dispose());
			this.guiItems.clear();
			this.guiItems = null;
			window.debugWebglComponentCount--;
		}
	}
}

BaseComponent.triggerAttached = triggerAttached;
function triggerAttached(scene, component) {
	const children = component.children;
	const mixins = component.usedMixins;
	if (component.isAttached) return;
	component.isAttached = true;
	component.scene = scene;
	if (component.attached) component.attached();
	for (let i = mixins.length - 1; i >= 0; i--) {
		mixins[ i ].componentAttached(component);
	}
	for (let i = children.length - 1; i >= 0; i--) {
		triggerAttached(scene, children[ i ]);
	}
}

BaseComponent.triggerDetached = triggerDetached;
function triggerDetached(component) {
	const children = component.children;
	const mixins = component.usedMixins;
	if (!component.isAttached) {
		component.scene = null;
		return;
	}
	for (let i = children.length - 1; i >= 0; i--) {
		triggerDetached(children[ i ]);
	}
	for (let i = mixins.length - 1; i >= 0; i--) {
		mixins[ i ].componentDetached(component);
	}
	component.isAttached = false;
	if (component.detached) component.detached();
	component.scene = null;
}

