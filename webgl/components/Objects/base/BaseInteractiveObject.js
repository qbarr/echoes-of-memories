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

		const cam = this.webgl.$povCamera;
		const vec3 = Vector3.get();
		const dir = Vector3.get();

		vec3.copy(this.base.position);
		dir.copy(cam.base.position).sub(vec3).normalize();
		vec3.addScaledVector(dir, 4);
		vec3.y = 0;
		cam.goTo(vec3);

		dir.release();
		vec3.release();

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
		});
	}
	onLeave() {
		this.log('INTERACTION:leave');
		this.webgl.$composer.removeOutline(this.mesh);
		this.webgl.$scenes.ui.component.crosshair.toggleHover(false);
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
