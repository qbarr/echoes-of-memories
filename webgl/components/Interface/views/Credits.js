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

		this.name = 'Credits';
		this.background = this.add(UiBackground, {
			opacity: 0.825,
		});
		this.background.base.position.set(0, 0, -1);

		this.content = [
			{
				title: 'UNE CREATION DE',
				names: [
					'AYOUB......MOULMAAZ',
					'ALEX......GATTEFOSE',
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
					'ALEX......GATTEFOSE',
					'ULYSSE......GRAVIER',
					'QUENTIN.....BARROCA',
				],
			},
			{
				title: 'DOUBLEURS',
				names: ['BEN.........VICTOR NIVERD', 'ADAMN...ALEXIS ThOMASSIAN'],
			},
			{
				title: 'REMERCIEMENTS',
				description: '-- NOUS TENONS EGALEMENT A REMERCIER --',
				names: [
					'MATHIEU....EHRSAM',
					'ADRIEN.....MELCHIOR',
					'SERGE......BOCANCEA',
					'FLORIAN....ZUMBRUNN',
					'LOREEN.....CASATI',
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

		this.setCurretGroup = this.setCurretGroup.bind(this);

		this.setCurretGroup(0);
	}

	createTitle() {
		this.title = this.add(UiText, {
			text: {
				name: 'UiCreditsTitle',
				content: 'ECHOES OF MEMORIES',
				color: new Color(0xffd700).offsetHSL(0, 0.3, 0.1),
				letterSpacing: -3,
				scale: 1,
			},
			// componentWidth: this.vw / 2.4,
			componentWidth: 750,
			justifyContent: 'left',
		});
		this.title.base.position.add(new Vector3(1, 18, 0));
	}

	createNavigation() {
		this.tabs = ['1', '2', '3', '4', '5', '6'];
		this.navigation = this.add(UiNavigation, {
			tabs: this.tabs,
			activeTab: 0,
		});
		this.navigation.base.position.add(new Vector3(22, -22, 0));

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
					color: new Color(0xffffff),
					scale: 1,
				},
				componentWidth: 700,
				justifyContent: 'left',
			});
			group.title.base.position.add(new Vector3(-1.5, 8, 0));

			if ($.names) {
				group.names = [];

				$.names.forEach((_, j) => {
					const name = this.add(
						UiText,
						{
							text: {
								name: 'UiCreditsTab' + i + 'Name' + j,
								content: _,
								color: new Color(0xffffff),
								scale: 1,
							},
							componentWidth: 700,
							justifyContent: 'left',
						},
						// group,
					);
					name.base.position.add(new Vector3(-1, 2 - j * 3.8, 0));
					group.names.push(name);
				});

				this.groups.push(group);
			}
		});
	}

	setCurretGroup(i) {
		// console.log('SET CURRENT GROUP', i);

		this.groups.forEach((group, j) => {
			group.title.base.visible = i === j;
			group.names.forEach((name) => {
				name.base.visible = i === j;
			});
		});
	}

	afterInit() {
		this.hide();
	}
}
