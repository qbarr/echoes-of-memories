import BaseComponent from '#webgl/core/BaseComponent';
import { Object3D } from 'three';

import { useInteraction } from './useInteraction';
import { useProximity } from './useProximity';
import { w } from '#utils/state';

export class BaseInteractiveObject extends BaseComponent {
	static isInteractiveObject = true;

	constructor(props = {}) {
		super(props);
		this.base = new Object3D();
	}

	afterInit() {
		const { padding } = useInteraction(this);
		this.padding = padding;

		const { threshold } = useProximity(this);
		this.threshold = threshold;
	}

	onClick() {
		this.log('INTERACTION:click');
	}
	onHold() {
		this.log('INTERACTION:hold');
	}
	onEnter() {
		this.log('INTERACTION:enter');
	}
	onLeave() {
		this.log('INTERACTION:leave');
	}

	onEnterPerimeter() {
		this.log('PERIMETER:enter');
	}
	onLeavePerimeter() {
		this.log('PERIMETER:leave');
	}
	onInsidePerimeter(distance, normDistance) {
		this.log('PERIMETER:inside', distance, normDistance);
	}

	update() {}

	/// #if __DEBUG__
	devtools(_gui) {
		this.gui = _gui.addFolder({ title: this.name });
	}
	/// #endif
}
