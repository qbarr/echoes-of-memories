import { Vector3, Object3D } from 'three';
import BaseCamera from '#webgl/core/BaseCamera';
import POVController from '#webgl/utils/POVController.js';

const HEIGHT = 4;

const defaultTarget = {
	object: new Object3D(),
	offset: new Vector3(0, HEIGHT, 0),
};

export class POVCamera extends BaseCamera {
	async init() {
		console.log('[POVCamera] init');
		this.$pointerLocked = false;

		this.onClick = this.onClick.bind(this);
		this.onPointerLockChange = this.onPointerLockChange.bind(this);

		this.$idleAnimation = {
			$duration: 3000, // in ms
			$factor: 0.1, // how much the camera will move up and down
		};
		this.$startTime = null;
		this.$progress = 0;
		this.$forward = true;
	}

	/// #if __DEBUG__
	devtools() {
		const $gui = this.webgl.$app.$gui;

		const gui = $gui.addFolder({ title: 'POVCamera' });
	}
	/// #endif

	afterInit() {
		super.afterInit();
		console.log('[POVCamera] afterInit');

		this.base.position.fromArray([2.9116, HEIGHT, 7.49768]);
		this.base.quaternion.fromArray([-0.04, 0.5, 0.03, 0.8]);
		this.base.fov = 35;

		this.controls = POVController(this.cam, {
			enabled: this.$pointerLocked,
			target: defaultTarget,
			panSpeed: 0.01,
		});

		const { $canvas, $raycast, $assets } = this.webgl;

		document.addEventListener('click', this.onClick);
		document.addEventListener(
			'pointerlockchange',
			this.onPointerLockChange,
		);
	}

	onPointerLockChange() {
		console.log('[POVCamera] onPointerLockChange', this.$pointerLocked);

		if (!this.$pointerLocked) {
			// console.log('[POVCamera] onPointerLockChange', this.$pointerLocked);
			this.$pointerLocked = true;
			this.controls.enabled = this.$pointerLocked;
		} else {
			this.$pointerLocked = false;
			this.controls.enabled = this.$pointerLocked;
		}
	}

	onClick() {
		const { $canvas } = this.webgl;

		if (!this.$pointerLocked) {
			console.log('[POVCamera] onClick');
			$canvas.requestPointerLock();
		}
	}

	easeInOutQuad(x) {
		return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
	}

	idleBreathing() {
		const { elapsed } = this.webgl.$time;
		const { $duration, $factor } = this.$idleAnimation;

		this.$startTime ??= elapsed;
		this.$progress = Math.min((elapsed - this.$startTime) / $duration, 1);

		const adjustedProgress = this.$forward
			? this.$progress
			: 1 - this.$progress;
		const ease = this.easeInOutQuad(adjustedProgress) * $factor;

		this.base.position.y = HEIGHT + ease;

		if (this.$progress >= 1) {
			this.$startTime = null;
			this.$forward = !this.$forward;
		}
	}

	update() {
		this.idleBreathing();

		if (this.controls) {
			this.controls.update();
		}

		// console.log('[POVCamera] update');
	}
}
