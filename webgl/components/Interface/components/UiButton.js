import BaseComponent from '#webgl/core/BaseComponent';
import { Object3D, Color, PlaneGeometry, MeshBasicMaterial, Mesh, Vector3 } from 'three';
import { MSDFTextMesh } from '../../Text';
import { UiText } from './UiText';
import { clamp, map } from '#utils/maths/map.js';

const defaultOptions = {
	text: {
		name: 'UiButton',
		font: 'VCR_OSD_MONO',
		content: '',
		// align: 'center',
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
};

export class UiButton extends BaseComponent {
	constructor(props = {}) {
		props = {
			...defaultOptions,
			...props,
		};

		super(props);
		console.log('UiButton props:', this.props);

		this.base = new Object3D();
		this.base.name = 'UiButton';
		this.base.index = this.props.index;

		this.color = this.props.text.color;
		this.hoveredColor = this.props.hoveredColor;
		this.backgroundColor = this.props.backgroundColor;

		this.onClick = this.onClick.bind(this);
		this.onEnter = this.onEnter.bind(this);
		this.onLeave = this.onLeave.bind(this);
	}

	init() {
		this.setupText();
		this.setupBackground();
		this.justifyContent();
	}

	setupText() {
		const { $viewport, $subtitles } = this.webgl;
		const { x: vw, y: vh } = $viewport.size.value;
		this.UiText = this.add(UiText, {
			...this.props,
			text: {
				...this.props.text,
				// width: this.props.componentWidth,
			},
		});

		this.backgroundWidth = map(this.UiText.width, 0, vw, 0, 160);
		// this.backgroundWidth = map(this.props.componentWidth, 0, vw, 0, 160);
	}

	setupBackground() {
		const height = 1 * this.props.text.scale;
		this.backgroundGeo = new PlaneGeometry(this.backgroundWidth, 4, 16, 16);
		this.backgroundMat = new MeshBasicMaterial({
			color: new Color(0xffd700),
			transparent: true,
			opacity: 0.9,
		});
		this.background = new Mesh(this.backgroundGeo, this.backgroundMat);
		this.background.position.set(0, 1.5, -1);
		this.base.add(this.background);
	}

	justifyContent() {
		const { $viewport, $subtitles } = this.webgl;
		const { x: vw, y: vh } = $viewport.size.value;

		const tx = (this.props.componentWidth - this.UiText.width) / 2;
		const mappedAlignLeft = map(tx, 0, vw, 0, 160);

		switch (this.props.justifyContent) {
			case 'left':
				this.background.position.set(-mappedAlignLeft, 1.5, -1);
				break;
			case 'right':
				this.background.position.set(mappedAlignLeft, 1.5, -1);
				break;
		}
	}

	afterInit() {
		const scene = this.scene;

		this.webgl.$raycast.add(this.background, {
			onClick: this.props.onClick ? this.props.onClick : this.onClick,
			onEnter: this.onEnter,
			onLeave: this.onLeave,
			forcedScene: scene,
		});

		this.onLeave();
	}

	onClick() {
		console.log('click');
	}

	onEnter() {
		this.hoverIn();
	}

	onLeave() {
		this.hoverOut();
	}

	hoverIn() {
		this.background.visible = true;
		this.UiText.text.editColor(this.hoveredColor.clone());
		document.body.style.cursor = 'pointer';
	}

	hoverOut() {
		this.background.visible = false;
		this.UiText.text.editColor(this.color.clone());
		document.body.style.cursor = 'auto';
	}
}