import BaseComponent from '#webgl/core/BaseComponent';
import { Object3D, Vector3 } from 'three';

import { useInteraction } from './useInteraction';
import { useProximity } from './useProximity';
import { w } from '#utils/state';

export class BaseInteractiveObject extends BaseComponent {
	constructor(props = {}) {
		super(props);
		this.isInteractiveObject = true;
		this.base = new Object3D();
	}

	beforeInit() {
		const m = (this.mesh = this.props.mesh);
		this.raycastMesh = this.props?.data?.raycastMesh ?? m.clone();

		this.base.position.copy(m.position.clone());
		this.base.rotation.copy(m.rotation.clone());

		m.position.set(0, 0, 0);
		m.rotation.set(0, 0, 0);

		this.base.add(m);
	}

	afterInit() {
		const { padding } = useInteraction(this);
		this.padding = padding;

		const { threshold } = useProximity(this);
		this.threshold = threshold;
	}

	onClick() {
		this.log('INTERACTION:click');

		// TODO: Go to this object
		// TODO: Subtitles
		// TODO: Transition
	}
	onHold() {
		this.log('INTERACTION:hold');
	}
	onEnter() {
		this.webgl.$hooks.afterFrame.watchOnce(() => {
			this.log('INTERACTION:enter');
			this.webgl.$composer.addOutline(this.mesh);
			this.webgl.$scenes.ui.component.crosshair.toggleHover(true);
			this.webgl.$povCamera.onInteractiveEnter();
		});
	}
	onLeave() {
		this.log('INTERACTION:leave');
		this.webgl.$composer.removeOutline(this.mesh);
		this.webgl.$scenes.ui.component.crosshair.toggleHover(false);
		this.webgl.$povCamera.onInteractiveLeave();
	}

	onEnterPerimeter() {
		this.log('PERIMETER:enter');
	}
	onLeavePerimeter() {
		this.log('PERIMETER:leave');
	}
	onInsidePerimeter(distance, normDistance) {
		// this.log('PERIMETER:inside', distance, normDistance);
	}

	/// #if __DEBUG__
	devtools(_gui) {
		this.gui = _gui.addFolder({ title: this.name });
	}
	/// #endif
}
