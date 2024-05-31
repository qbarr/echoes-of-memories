import BaseComponent from '#webgl/core/BaseComponent';
import { Object3D } from 'three';

import { useProximity } from './useProximity';

export class BaseSoundObject extends BaseComponent {
	constructor(props = {}) {
		super(props);

		this.base = new Object3D();

		const { threshold } = useProximity(this);
		this.threshold = threshold;

		this.attachSound();
	}

	attachSound() {
		const sound = this.webgl.$sounds.getSound({ id: 'dsi' });
		console.log('ATTACH SOUND', sound);
		this.base.add(sound);

		sound.setRefDistance(20);
		// sound.play();
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
