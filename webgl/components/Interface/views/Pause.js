import { watch } from 'vue';
import { Object3D, Color, Vector3 } from 'three';

import { UiBackground, UiText, UiButton } from '../components';
import { BaseUiView } from '#webgl/core/BaseUiView.js';

export class Pause extends BaseUiView {
	init() {
		const { $viewport, $subtitles } = this.webgl;
		const { x: vw, y: vh } = $viewport.size.value;

		this.vw = vw;
		this.vh = vh;

		this.background = this.add(UiBackground);
		this.background.base.position.set(0, 0, -1);

		this.createTitle();
		this.createButton();
	}

	createTitle() {
		this.title = this.add(UiText, {
			text: {
				name: 'UiPauseTitle',
				content: '-----PAUSE-----',
				// align: 'left',
				color: new Color(0xffd700).offsetHSL(0, 0.3, 0.1),
				letterSpacing: -3,
				// scale: 1.35,
				scale: 1,
			},
			// componentWidth: this.vw / 2.4,
			componentWidth: 700,
			justifyContent: 'left',
		});
		this.title.base.position.add(new Vector3(3, 6, 0));
	}

	createButton() {
		const { left } = this.camera.base;
		const padding = 8;

		this.buttons = [
			{
				text: 'REPRENDRE',
				component: null,
			},
			{
				text: 'PARAMETRES',
				component: null,
			},
		];

		this.buttons.forEach((button, i) => {
			button.component = this.add(UiButton, {
				text: {
					name: 'UIButton' + i,
					content: button.text,
					// align: 'left',
					color: new Color(0xffffff),
					hoveredColor: new Color(0x000000),
					scale: 0.85,
					// scale: 1,
					// width: 400,
				},
				backgroundColor: new Color(0xffd700).offsetHSL(0, 0.3, 0.1),
				// componentWidth: this.vw / 2.4,
				componentWidth: 700,
				justifyContent: 'left',
			});
			button.component.base.position.add(new Vector3(0, -i * 5, 0));
		});
	}

	afterInit() {
		this.hide();
	}
}
