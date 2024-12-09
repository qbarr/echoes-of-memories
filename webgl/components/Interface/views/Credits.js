import { watch } from 'vue';
import { Object3D, Color, Vector3, Group, Vector2 } from 'three';

import { UiBackground, UiText, UiButton, UiNavigation } from '../components';
import { BaseUiView } from '#webgl/core/BaseUiView.js';

const GLOBAL_OFFSET = new Vector2(5, 0);


export class Credits extends BaseUiView {
	init() {
		const { $viewport, $subtitles } = this.webgl;
		const { x: vw } = $viewport.size.value;

		this.vw = vw * .75

		this.content = [
			`UNE CREATION DE\n\nAYOUB......MOULMAAZ\nALEX.....GATTEFOSSE\nJESSICA.....POULAIN\nULYSSE......GRAVIER\nGAELLE.......SOARES\nQUENTIN.....BARROCA\n `,
			`DESIGNERS\n\nAYOUB......MOULMAAZ\nJESSICA.....POULAIN\nGAELLE.......SOARES\n\n \n \n `,
			`DEVELOPPEURS\n\nALEX.....GATTEFOSSE\nULYSSE......GRAVIER\nQUENTIN.....BARROCA\n\n \n \n `,
			`DOUBLEURS\n\nBEN.........VICTOR NIVERD\nADAM...ALEXIS THOMASSIAN\n\n \n \n \n `,
			`REMERCIEMENTS\n\nFLORIAN....ZUMBRUNN\nSERGE......BOCANCEA\nLYO........ROUDINE\nADRIEN.....MELCHIOR\nMATHIEU....EHRSAM\n `,
			`NOTES CONNEXES\n\nCE PROJET A ETE CREE AU SEIN\nDU MASTER DMII 2 DE GOBELIN,\nL'ECOLE DE L'IMAGE.\n\nECHOES OF MEMORIES,\nTOUT DROITS RESERVES\n `
		];

		this.createTitle();
		this.createGroups();
		this.createNavigation();
		this.createBackButton();

		this.setCurretGroup = this.setCurretGroup.bind(this);
		this.goToPause = this.goToPause.bind(this);

		this.setCurretGroup(0);
	}

	createTitle() {
		const { x: vw } = this.webgl.$viewport.size.value;

		this.title = this.add(UiText, {
			text: {
				name: 'UiCreditsTitle',
				content: '-----CREDITS-----',
				color: new Color(0xffd700).offsetHSL(0, 0.3, 0.1),
				align: 'center',
			},
			componentWidth: vw * .3
		});

		this.translate(this.title, { x: 0, y: 16 });
	}

	createNavigation() {
		this.tabs = ['1', '2', '3', '4', '5', '6'];
		this.navigation = this.add(UiNavigation, {
			tabs: this.tabs,
			activeTab: 0,
			width: this.vw
		});
		this.translate(this.navigation, { x: -30 + GLOBAL_OFFSET.x, y: -22 });

		this.navigation.currentIndex.watch((i) => {
			this.setCurretGroup(i);
		});
	}

	createGroups() {
		this.groups = [];

		this.content.forEach((content, i) => {
			const group = {};

			group.content = this.add(UiText, {
				text: {
					name: 'UiCreditsTab' + i,
					content,
					scale: .75,
					align: 'left',
					justifyContent: 'left',
					lineHeight: 45,
					width: this.vw
				},
			});
			this.translate(group.content, { x: 12 + GLOBAL_OFFSET.x, y: -17 });
			this.groups.push(group);
		});
	}

	setCurretGroup(i) {
		this.groups.forEach((group, j) => {
			group.content.base.visible = i === j;
		});
	}

	createBackButton() {
		this.backButton = this.add(UiButton, {
			text: {
				scale: 0.75,
				name: 'UiBackButtonCredit',
				content: 'RETOUR',
			},
			justifyContent: 'right',
			componentWidth: this.vw / 2,
			callback: this.goToPause,
		});

		this.translate(this.backButton, { x: 0, y: -22 });
	}

	goToPause() {
		this.scene.$setState('pause');
	}

	afterInit() {
		this.hide();
	}
}
