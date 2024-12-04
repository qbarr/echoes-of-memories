import { Color } from 'three';

import { w } from '#utils/state/index.js';
import { BaseUiView } from '#webgl/core/BaseUiView.js';
import { UiText } from '../components';

export class Generique extends BaseUiView {
	init() {
		const content = [
			'ECHOES OF MEMORIES.',

			`DEVELOPPEURS\n\n
			QUENTIN....BARROCA\n
			ULYSSE.....GRAVIER\n
			ALEX.......GATTEFOSSE\n`,

			`DESIGNERS\n\n
			GAELLE.....SOARES\n
			JESSICA....POULAIN\n
			AYOUB......MOULMAAZ\n`,

			`DOUBLEURS\n\n
			BEN........VICTOR NIVERD\n
			ADAMN......ALEXIS THOMASSIAN\n`,

			`REMERCIEMENTS\n\n
			FLORIAN....ZUMBRUNN\n
			SERGE......BOCANCEA\n
			LYO........ROUDINE\n
			ADRIEN.....MELCHIOR\n
			MATHIEU....EHRSAM\n`,

			`CE PROJET A ETE CREE AU SEIN\n
			DU MASTER DMII 2 DE \n
			GOBELINS, L'ECOLE DE L'IMAGE.\n
			\n
			ECHOES OF MEMORIES,\n
			TOUT DROITS RESERVES.\n`,

			`MERCI.\n`
		];

		this.texts = content.map((t, i) => {
			const text = this.add(UiText, {
				text: {
					name: 'GeneriqueText_' + i,
					content: t,
					scale: .75,
					color: new Color(0xffffff),
					align: 'left',
					justifyContent: 'center',
					centerMesh: { x: true, y: true },
					lineHeight: 25,
				},
				justifyContent: 'center',
			});

			this.translate(text, { x: 0, y: 0 });
			text.base.visible = false;

			return text;
		})

		this.currentIndex = w(-1);
		this.currentIndex.watch((v) => this.setCurrentContent(v));

		this.setCurrentContent(null);
	}

	setCurrentContent(i) {
		this.texts.forEach((text, j) => text.base.visible = j === i);
	}

	// createSheet({ id, name = '' }) {
	// 	if (!id.length) return;

	// 	const sheet = this.$project.getSheet(id + name);

	// 	sheet.$float('text index', this.currentIndex, {
	// 		range: [-1, this.texts.length - 1],
	// 	})
	// 		.onChange((v) => this.currentIndex.set(v, true));

	// 	return sheet;
	// }

	afterInit() {
		this.hide();
	}
}
