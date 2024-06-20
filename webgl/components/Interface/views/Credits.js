import { watch } from 'vue';
import { Object3D, Color, Vector3, Group } from 'three';

import { UiBackground, UiText, UiButton, UiNavigation } from '../components';
import { BaseUiView } from '#webgl/core/BaseUiView.js';

export class Credits extends BaseUiView {
	init() {
		const { $viewport, $subtitles } = this.webgl;
		const { x: vw, y: vh } = $viewport.size.value;

		this.vw = vw;
		this.vh = vh;

		// this.name = 'Credits';

		this.content = [
			{
				title: 'UNE CREATION DE',
				names: [
					'AYOUB......MOULMAAZ',
					'ALEX.....GATTEFOSSE',
					'JESSICA.....POULAIN',
					'ULYSSE......GRAVIER',
					'GAELLE.......SOARES',
					'QUENTIN.....BARROCA',
				],
			},
			{
				title: 'DESIGNERS',
				names: [
					'AYOUB......MOULMAAZ',
					'JESSICA.....POULAIN',
					'GAELLE.......SOARES',
				],
			},
			{
				title: 'DEVELOPPEURS',
				names: [
					'ALEX.....GATTEFOSSE',
					'ULYSSE......GRAVIER',
					'QUENTIN.....BARROCA',
				],
			},
			{
				title: 'DOUBLEURS',
				names: ['BEN.........VICTOR NIVERD', 'ADAMN...ALEXIS THOMASSIAN'],
			},
			{
				title: 'REMERCIEMENTS',
				description: '-- NOUS TENONS EGALEMENT A REMERCIER --',
				names: [
					'MATHIEU....EHRSAM',
					'ADRIEN.....MELCHIOR',
					'SERGE......BOCANCEA',
					'FLORIAN....ZUMBRUNN',
					'LYO........ROUDINE',
				],
			},
			{
				title: 'NOTES CONNEXES:',
				names: [
					'CE PROJET A ETE CREE AU SEIN',
					'DU MASTER DMII DE GOBELIN,',
					"L'ECOLE DE L'IMAGE.",
					'',
					'ECHOES OF MEMORIES©2024',
					'TOUT DROITS RESERVES',
				],
			},
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
		this.title = this.add(UiText, {
			text: {
				name: 'UiCreditsTitle',
				content: 'ECHOES OF MEMORIES',
				color: new Color(0xffd700).offsetHSL(0, 0.3, 0.1),
			},
			justifyContent: 'left',
		});

		this.translate(this.title, { x: -6.5, y: 18 });
	}

	createNavigation() {
		this.tabs = ['1', '2', '3', '4', '5', '6'];
		this.navigation = this.add(UiNavigation, {
			tabs: this.tabs,
			activeTab: 0,
		});
		this.translate(this.navigation, { x: -34.5, y: -22 });

		this.navigation.currentIndex.watch((i) => {
			this.setCurretGroup(i);
		});
	}

	createGroups() {
		this.groups = [];

		this.content.forEach(($, i) => {
			const group = {};

			group.title = this.add(UiText, {
				text: {
					name: 'UiCreditsTab' + i,
					content: $.title,
				},
				justifyContent: 'left',
			});
			this.translate(group.title, { x: -6.5, y: 10 });

			if ($.names) {
				group.names = [];

				$.names.forEach((_, j) => {
					const name = this.add(UiText, {
						text: {
							name: 'UiCreditsTab' + i + 'Name' + j,
							content: _,
						},
						justifyContent: 'left',
					});
					this.translate(name, { x: -6, y: 4 - j * 3.8 });
					group.names.push(name);
				});

				this.groups.push(group);
			}
		});
	}

	setCurretGroup(i) {
		this.groups.forEach((group, j) => {
			group.title.base.visible = i === j;
			group.names.forEach((name) => {
				name.base.visible = i === j;
			});
		});
	}

	createBackButton() {
		this.backButton = this.add(UiButton, {
			text: {
				name: 'UiBackButtonCredit',
				content: 'RETOUR',
			},
			justifyContent: 'left',
			callback: this.goToPause,
		});

		this.translate(this.backButton, { x: 48, y: -22 });
	}

	goToPause() {
		this.scene.$setState('pause');
	}

	afterInit() {
		this.hide();
	}
}
