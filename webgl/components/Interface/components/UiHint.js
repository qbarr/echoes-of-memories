import BaseComponent from '#webgl/core/BaseComponent';
import { Object3D, Color, Vector3 } from 'three';
import { MSDFTextMesh } from '../../Text';
import { map } from '#utils/maths/map.js';

import { useTimers } from '#app/composables/useTimers/useTimers';
import { w } from '#utils/state';

import { watch } from 'vue';

const defaultOptions = {
	content: '<THIS HINT SHOULD BE HELPFULL FOR THE USER>',
};

export class UiHint extends BaseComponent {
	constructor(props = {}) {
		props = {
			...defaultOptions,
			...props,
		};
		super(props);

		this.base = new Object3D();

		this.timer = useTimers();

		this.anitmating = false;
		this.activeState = w(true);
	}

	init() {
		this.text = this.add(MSDFTextMesh, {
			name: 'UiHint',
			font: 'VCR_OSD_MONO',
			content: this.props.content,
			align: 'left',
			color: new Color(0xffd700).offsetHSL(0, 0.3, 0.1),
			strokeWidth: 0,
			letterSpacing: 0,
			centerMesh: { x: false, y: false },
		});

		this.width = this.text.geo._layout.width;
	}

	afterInit() {
		this.justifyContent();
		this.base.scale.setScalar(0.4);
		this.parent.translate(this, { x: -36, y: 22 });

		const { $hooks } = this.webgl;
		// $hooks.afterStart.watchOnce(this.afterStart.bind(this));
	}

	// afterStart() {
	// 	console.log('[HINT] after');
	// 	const { $povCamera, $hooks } = this.webgl;
	// 	const { controls: povController } = $povCamera;

	// 	console.log('afterStart', povController.state.value);
	// 	povController.state.watch(this.onPovControllerStateChange.bind(this));
	// }

	// onPovControllerStateChange(value) {
	// 	console.log('onPovControllerStateChange', value);
	// }

	justifyContent() {
		const { $viewport, $subtitles } = this.webgl;
		const { x: vw, y: vh } = $viewport.size.value;

		const tx = (this.props.componentWidth - this.width) / 2;
		const mappedAlignLeft = map(tx, 0, vw, 0, 160);

		switch (this.props.justifyContent) {
			case 'left':
				this.base.position.set(-mappedAlignLeft, 0, 0);
				break;
			case 'right':
				this.base.position.set(mappedAlignLeft, 0, 0);
				break;
		}
	}

	show() {
		// if (!this.activeState.value) return;

		this.text.base.visible = true;

		if (!this.blinking) {
			this.edit({ t: defaultOptions.content });
		}
	}

	hide() {
		// if (this.activeState.value) return;

		// console.log('[HINT] HIDE', this.text);
		this.text.base.visible = false;
	}

	async blink({ duration = 1000 }) {
		this.blinking = true;
		this.timer.setInterval(() => {
			this.show();
		}, '75');
		this.timer.setInterval(() => {
			this.hide();
		}, '200');
		await this.timer.wait(duration);
		this.timer.clearTimers();
		this.blinking = true;
	}

	// async animateIn() {
	// 	console.log('[HINT] Animate IN');
	// 	this.anitmating = true;

	// 	await this.blink({ duration: 1000 });
	// 	this.show();

	// 	// await this.timer.wait(2000);
	// 	// await this.edit({ t: 'LE PATIENT S’EST REVEILLE' });

	// 	// await this.timer.wait(2000);
	// 	// await this.edit({ t: 'EXPLOREZ LA PIECE' });
	// }

	// async animateOut() {
	// 	this.anitmating = true;

	// 	await this.blink();
	// 	this.hide();
	// }

	async edit({ t = '', bypassAnim = false }) {
		// if (!bypassAnim) {
		// 	await this.blink({ duration: 500 });
		// }
		this.hide();
		this.text.edit(t);
		await this.timer.wait(200);
		if (!bypassAnim) {
			await this.blink({ duration: 1000 });
		}
		this.show();
	}
}
