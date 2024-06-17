import { watch } from 'vue';
import { Object3D, Color, Vector3 } from 'three';

import { UiBackground, UiText, UiButton } from '../components';
import { BaseUiView } from '#webgl/core/BaseUiView.js';

import { Crosshair } from '../Crosshair';

export class Hud extends BaseUiView {
	init() {
		// Crosshair
		this.crosshair = this.add(Crosshair);

		this.createHint();
	}

	createHint() {
		const { $viewport } = this.webgl;
		const { x: vw, y: vh } = $viewport.size.value;
		const { top } = this.camera.base;

		this.hint = this.add(UiText, {
			text: {
				content: '> THIS HINT SHOULD BE HELPFULL FOR THE USER',
				align: 'center',
				color: new Color(0xffd700).offsetHSL(0, 0.3, 0.1),
				scale: 0.35,
				letterSpacing: -3,
			},
			componentWidth: vw,
			justifyContent: 'left',
		});

		this.hint.base.position.add(new Vector3(17, top - 2, 0));
	}

	afterInit() {
		this.hide();
	}
}
