import BaseComponent from '#webgl/core/BaseComponent';
import { Object3D, Color, PlaneGeometry, MeshBasicMaterial, Mesh, Vector3 } from 'three';
import { MSDFTextMesh } from '../../Text';
import { UiText } from './UiText';
import { clamp, map } from '#utils/maths/map.js';
import { UiButton } from './UiButton';
import { reactive } from 'vue';

import { w } from '#utils/state';

const defaultOptions = {
	text: {
		name: 'UiNavigation',
		font: 'VCR_OSD_MONO',
		content: '',
		align: 'center',
		color: new Color(0xffffff),
		strokeColor: new Color(0x000000),
		strokeWidth: 0.5,
		scale: 1,
		letterSpacing: 0,
		centerMesh: { x: true, y: false },
		width: null,
	},
	hoveredColor: new Color(0x000000),
	componentWidth: 600,

	tabs: ['1', '2', '3', '4'],
	activeTab: 0,
};

export class UiNavigation extends BaseComponent {
	constructor(props = {}) {
		props = {
			...defaultOptions,
			...props,
		};

		// console.log('UiNavigation props:', props);

		super(props);

		this.name = 'UiNavigation';
		this.base = new Object3D();
		this.base.name = 'UiNavigation';

		this.color = this.props.text.color;
		this.hoveredColor = this.props.text.hoveredColor;
		this.backgroundColor = this.props.backgroundColor;

		this.navClick = this.navClick.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);

		this.addListeners();
	}

	init() {
		this.setupTabs();
	}

	setupTabs() {
		this.tabs = [];
		this.currentIndex = w(this.props.activeTab);

		const { $viewport, $subtitles } = this.webgl;
		const { x: vw, y: vh } = $viewport.size.value;

		this.props.tabs.forEach((tab, i) => {
			const text = this.add(UiButton, {
				text: {
					name: 'UiNav' + i,
					content: tab,
				},
				index: i,
				callback: this.navClick,
			});
			text.base.position.set(i * 4, 0, 0);
			this.tabs.push(text);
		});

		this.tabs[this.currentIndex.value].hoverIn();
	}

	navClick(e) {
		const { object } = e;
		const { index } = object.parent;

		if (object && !isNaN(index)) {
			this.currentIndex.set(index, true);
		}
	}

	addListeners() {
		document.addEventListener('keydown', this.onKeyDown);
	}

	onKeyDown(e) {
		if (e.key === 'ArrowRight') {
			this.tabs[this.currentIndex.value].hoverOut();
			this.currentIndex.set(
				clamp(this.currentIndex.value + 1, 0, this.tabs.length - 1),
				true,
			);
			this.tabs[this.currentIndex.value].hoverIn();
		} else if (e.key === 'ArrowLeft') {
			this.tabs[this.currentIndex.value].hoverOut();
			this.currentIndex.set(
				clamp(this.currentIndex.value - 1, 0, this.tabs.length - 1),
				true,
			);
			this.tabs[this.currentIndex.value].hoverIn();
		}
	}
}
