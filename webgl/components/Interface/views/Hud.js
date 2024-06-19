import { watch } from 'vue';
import { Object3D, Color, Vector3 } from 'three';

import { UiBackground, UiText, UiButton, UiHint } from '../components';
import { BaseUiView } from '#webgl/core/BaseUiView.js';

import { Crosshair } from '../Crosshair/Crosshair';

export class Hud extends BaseUiView {
	init() {
		// Crosshair
		this.crosshair = this.add(Crosshair);

		// Hint
		this.hint = this.add(UiHint);
	}

	afterInit() {
		this.hide();
	}
}
