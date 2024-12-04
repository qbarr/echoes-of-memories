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
				name: 'UiTextWarningTitle',
				content: 'ATTENTION',
				color: new Color(0xffd700).offsetHSL(0, 0.3, 0.1),
				align: 'center',
				justifyContent: 'center',
				centerMesh: { x: true, y: true },
			},
			componentWidth: 700,
			justifyContent: 'center',
		});

		this.p = this.add(UiText, {
			text: {
				scale: 0.65,
				name: 'UiTextWarningP',
				content:
					'LE CONTENU SUIVANT CONTIENT DES MOMENTS DERANGEANTS QUI PEUVENT ETRE VIOLENTS POUR LES SPECTATEURS.\n\n SOYEZ VIGILANTS.',
				width: vw / 2,
				justifyContent: 'center',
				align: 'center',
				centerMesh: { x: true, y: true },
			},
			justifyContent: 'center',
		});

		this.translate(this.title, { y: 12 });
		this.translate(this.p, { x: 0, y: -3 });
	}

	afterInit() {
		this.hide();
	}
}
