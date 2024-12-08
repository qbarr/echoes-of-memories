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
		align: 'center',
		color: new Color(0xffffff),
		strokeColor: new Color(0x000000),
		strokeWidth: 0,
		scale: 1,
		letterSpacing: 0,
		centerMesh: { x: true, y: false },
		width: null,
	},
	backgroundColor: new Color(0xffd700).offsetHSL(0, 0.1, 0.1),
	hoveredColor: new Color(0x000000),
	componentWidth: 600,
	forceHover: false,
	justifyContent: 'center',
};

const NOOP = () => {};

export class UiButton extends BaseComponent {
	constructor(props = {}) {
		props = {
			...defaultOptions,
			...props,
			text: {
				...defaultOptions.text,
				...props.text,
			},
		};

		super(props);

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
			},
		});

		this.backgroundWidth = map(this.UiText.width, 0, vw, 0, 160) + 2;
		// this.backgroundWidth = map(this.props.componentWidth, 0, vw, 0, 160);
	}

	setupBackground() {
		const height = this.props.text.scale;

		this.backgroundGeo = new PlaneGeometry(this.backgroundWidth * height, 4 * height, 16, 16);
		this.backgroundMat = new MeshBasicMaterial({
			color: this.backgroundColor,
			transparent: true,
			opacity: 0.9,
		});
		this.background = new Mesh(this.backgroundGeo, this.backgroundMat);
		this.background.position.set(0, 1.5 * height, -0.1);
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
		this.raycastObject = this.webgl.$raycast.add(this.background, {
			onClick: this.onClick,
			onEnter: this.onEnter,
			onLeave: this.onLeave,
			forcedScene: this.scene,
		});

		if (!this.props.forceHover) this.onLeave();

		this.webgl.$renderer.drawingBufferSize.watch(this.resize.bind(this));
	}

	resize() {
		this.setupText();
		this.justifyContent();
	}

	onClick(e) {
		if (!this?.parent?.base.visible) return;

		this.props.callback?.call(this, e);
	}

	onEnter() {
		if (!this?.parent?.base.visible) return;
		document.body.style.cursor = 'pointer';
		if (this.props.forceHover) return;
		this.hoverIn();
	}

	onLeave() {
		if (!this?.parent?.base.visible) return;
		document.body.style.cursor = 'auto';
		if (this.props.forceHover) return;
		this.hoverOut();
	}

	hoverIn() {
		const { $audio } = this.webgl;
		$audio.play('common/select', { volume: 3 });

		this.background.visible = true;
		this.UiText.text.editColor(this.hoveredColor.clone());
		// document.body.style.cursor = 'pointer';
	}

	hoverOut() {
		this.background.visible = false;
		this.UiText.text.editColor(this.color.clone());
		// document.body.style.cursor = 'auto';
	}

	show() {
		// console.log('[UI BUTTON] SHOW', this.raycastObject);
		this.raycastObject.enable();
	}

	hide() {
		// console.log('[UI BUTTON] HIDE', this.raycastObject);
		this.raycastObject.disable();
		this.onLeave();
		document.body.style.cursor = 'auto';
	}
}
