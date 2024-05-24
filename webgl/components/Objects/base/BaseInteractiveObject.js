import BaseComponent from '#webgl/core/BaseComponent';
import { Object3D } from 'three';

import { useInteraction } from './useInteraction';
import { useSoundProximity } from './useSoundProximity';
import { w } from '#utils/state';


export class BaseInteractiveObject extends BaseComponent {
	static isInteractiveObject = true;

	constructor(props = {}) {
		super(props);

		this.base = new Object3D();

		const { padding } = useInteraction(this)
		this.padding = padding

		useSoundProximity(this)
	}

	onClick() {
		this.log('click');
	}

	onHold() {
		this.log('hold');
	}

	onEnter() {
		this.log('enter');
	}

	onLeave() {
		this.log('leave');
	}

	update() {}

	/// #if __DEBUG__
	devtools(_gui) {
		this.gui = _gui.addFolder({ title: this.name });
	}
	/// #endif
}
