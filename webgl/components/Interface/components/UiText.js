import BaseComponent from '#webgl/core/BaseComponent';
import { Object3D, Color, Vector3 } from 'three';
import { MSDFTextMesh } from '../../Text';
import { map } from '#utils/maths/map.js';

const defaultOptions = {
	text: {
		name: 'UiText',
		font: 'VCR_OSD_MONO',
		content: '',
		// align: 'center',
		align: 'left',
		color: new Color(0xffffff),
		strokeColor: new Color(0x000000),
		strokeWidth: 0.5,
		scale: 1,
		letterSpacing: 0,
		centerMesh: { x: true, y: false },
		width: null,
	},
	componentWidth: 600,
};

export class UiText extends BaseComponent {
	constructor(props = {}) {
		props = {
			...defaultOptions,
			...props,
		};
		super(props);
		// console.log('UiText props:', props.componentWidth, props.text.width);

		this.base = new Object3D();

		this.text = this.add(MSDFTextMesh, {
			...this.props.text,
			align: 'left',
		});
		this.base.scale.set(
			this.props.text.scale,
			this.props.text.scale,
			this.props.text.scale,
		);

		this.width = this.text.geo._layout.width;
	}

	afterInit() {
		this.justifyContent();
	}

	justifyContent() {
		const { $viewport, $subtitles } = this.webgl;
		const { x: vw, y: vh } = $viewport.size.value;

		const tx = (this.props.componentWidth - this.width) / 2;
		const mappedAlignLeft = map(tx, 0, vw, 0, 160);

		// console.log('JUSTIFY', this.width, this.props.componentWidth);

		switch (this.props.justifyContent) {
			case 'left':
				this.base.position.set(-mappedAlignLeft, 0, 0);
				break;
			case 'right':
				this.base.position.set(mappedAlignLeft, 0, 0);
				break;
		}
	}

	show() {
		thtis.base.visible = true;
	}

	hide() {
		this.base.visible = false;
	}
}
