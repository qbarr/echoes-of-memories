import { watch } from 'vue';
import { Object3D, Color, Vector3 } from 'three';

import { UiBackground, UiText, UiButton } from '../components';
import { BaseUiView } from '#webgl/core/BaseUiView.js';

export class Splash extends BaseUiView {
	init() {
		const { $viewport } = this.webgl;
		const { x: vw, y: vh } = $viewport.size.value;
		const { right, width } = this.camera.base;

		this.background = this.add(UiBackground, {
			opacity: 1,
		});
		this.background.base.position.set(0, 0, -1);

		this.title = this.add(UiButton, {
			text: {
				content: '>> WAKE UP <<',
				align: 'center',
				color: new Color(0xffd700).offsetHSL(0, 0.3, 0.1),
				// scale: 0.5,
				scale: 1,
				strokeWidth: 0,
				letterSpacing: -2,
			},
			componentWidth: 900,
			justifyContent: 'center',
		});
	}

	afterInit() {
		this.hide();
	}
}
