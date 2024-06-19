import { watch } from 'vue';
import { Object3D, Color, Vector3 } from 'three';

import { UiBackground, UiText, UiButton } from '../components';
import { BaseUiView } from '#webgl/core/BaseUiView.js';

export class Warning extends BaseUiView {
	init() {
		const { $viewport } = this.webgl;
		const { x: vw, y: vh } = $viewport.size.value;
		const { right, width } = this.camera.base;

		// this.background = this.add(UiBackground, {
		// 	opacity: 1,
		// });
		// this.background.base.position.set(0, 0, -1);

		this.title = this.add(UiText, {
			text: {
				content: 'ATTENTION',
				align: 'left',
				color: new Color(0xffd700).offsetHSL(0, 0.3, 0.1),
				letterSpacing: -3,
				scale: 1.35,
			},
			componentWidth: vw / 2,
			justifyContent: 'center',
		});

		this.p = this.add(UiText, {
			text: {
				// content: 'Le contenu suivant contient des moments dérangeants qui peuvent être violents pour les spectateurs. Soyez vigilants.',
				content:
					'LE CONTENU SUIVANT CONTIENT DES MOMENTS DÉRANGEANTS QUI PEUVENT ÊTRE VIOLENTS POUR LES SPECTATEURS.\n SOYEZ VIGILANTS.',
				align: 'left',
				color: new Color(0xffd700).offsetHSL(0, 0.3, 0.1),
				letterSpacing: -3,
				scale: 0.85,
				width: vw / 2.3,
			},
			componentWidth: vw / 2,
			justifyContent: 'center',
		});

		this.title.base.position.add(new Vector3(0, 8, 0));
		this.p.base.position.add(new Vector3(0, -9, 0));
	}

	afterInit() {
		this.hide();
	}
}
