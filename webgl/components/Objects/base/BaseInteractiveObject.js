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
		this.$composables = {};

		this._onClick = (cb) => (this._onClick = cb);
	}

	beforeInit() {
		this.$project = this.scene.$project;

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

		// const { threshold } = useProximity(this);
		// this.threshold = threshold;
		this.webgl.$hooks.afterStart.watchOnce(this.createSheets.bind(this));
	}

	createSheets() {}

	hide() {
		this.base.visible = false;
		this.disableInteraction();
	}

	show() {
		this.base.visible = true;
		this.enableInteraction();
	}

	reset() {
		this._onClick = (cb) => (this._onClick = cb);
		this.$sheet?.stop();
	}

	onClick() {
		// this.log('INTERACTION:click');
		this._onClick?.();
	}
	onHold() {
		// this.log('INTERACTION:hold');
	}
	onEnter() {
		const { $hooks, $composer, $scenes, $povCamera } = this.webgl;
		$hooks.afterFrame.watchOnce(() => {
			// this.log('INTERACTION:enter');
			$composer.addOutline(this.mesh);
			$scenes.ui.component.crosshair.toggleHover(true);
			$povCamera.onInteractiveEnter();
		});
	}
	onLeave() {
		// this.log('INTERACTION:leave');
		const { $composer, $scenes, $povCamera } = this.webgl;
		$composer.removeOutline(this.mesh);
		$scenes.ui.component.crosshair.toggleHover(false);
		$povCamera.onInteractiveLeave();
	}

	disableInteraction() {
		this.onLeave();
		this.$composables['interaction'].disable();
	}

	enableInteraction() {
		this.$composables['interaction'].enable();
	}

	onEnterPerimeter() {
		// this.log('PERIMETER:enter');
	}
	onLeavePerimeter() {
		// this.log('PERIMETER:leave');
	}
	onInsidePerimeter(distance, normDistance) {
		this.log('PERIMETER:inside', distance, normDistance);
	}

	/// #if __DEBUG__
	devtools(_gui) {
		this.gui = _gui.addFolder({ title: this.name });
	}
	/// #endif
}


const ucfirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);
export class BaseBedroomInteractiveObject extends BaseInteractiveObject {
	async onClick() {
		super.onClick();

		this.disableInteraction();

		const { $povCamera, $raycast, $audio } = this.webgl;

		$raycast.disable();
		$povCamera.$setState('cinematic');

		$povCamera.isSfxActive = true;
		await this.$gotoSheet.play();
		$povCamera.isSfxActive = false;

		$povCamera.controls.focus_threshold.set(20)
		$povCamera.$setState('focus');
		$raycast.disable();

		await this.$audioSheet.play();
		$audio.play('common/short-glitch', { volume: .5, delay: 400 });
		await this.scene.$respawnFadeoutSheet.play()

		$raycast.enable();

		$povCamera.$setState('free');
		this.enableInteraction();
	}

	async createSheets() {
		const { $theatre } = this.webgl;

		this.$gotoSheet = this.$project.getSheet(`${ucfirst(this.objectName)} > Go To`);
		this.$gotoSheet.$addCamera();
		// this.$gotoSheet.$addComposer([ 'global', 'crt' ]);

		this.$audioSheet = this.$project.getSheet(`${ucfirst(this.objectName)} > Audio`);
		this.$audioSheet.attachAudio(this.audioId);
	}
}
