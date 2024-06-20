import { watch } from 'vue';
import { Object3D, Color, Vector3 } from 'three';

import { UiBackground, UiText, UiButton } from '../components';
import { BaseUiView } from '#webgl/core/BaseUiView.js';

export class Splash extends BaseUiView {
	init() {
		const { $viewport } = this.webgl;
		const { x: vw, y: vh } = $viewport.size.value;
		const { right, width } = this.camera.base;

		this.onStart = this.onStart.bind(this);

		this.title = this.add(UiButton, {
			text: {
				name: 'UiButtonSplash',
				content: 'COMMENCER',
			},
			callback: this.onStart,
		});

		this.translate(this.title, { y: -20 });
	}

	afterInit() {
		this.hide();
	}

	onStart() {
		this.webgl.$statesMachine.setState('hud');
	}
}
