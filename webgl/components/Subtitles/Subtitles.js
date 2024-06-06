import { watch } from 'vue';

import { Color, Object3D, Vector3 } from 'three';

import BaseComponent from '#webgl/core/BaseComponent';

import { MSDFTextMesh } from '../Text';

export class Subtitles extends BaseComponent {
	constructor(props = {}) {
		super(props);

		this.base = new Object3D();
	}

	init() {
		const { x: width, y: height } = this.webgl.$viewport.size.value;
		const scale = 0.02;

		this.t = this.add(MSDFTextMesh, {
			font: 'VCR_OSD_MONO',
			content: 'lorem ipsum dolot sit amet',
			width: width * 0.8,
			centerMesh: true,
			align: 'left',
			color: new Color(0xffd700).offsetHSL(0, 0.3, 0.2),
		});
		this.hide();

		// this.t.scale.set(scale, scale, 1);
		this.t.position.set(0, -40, 0);

		watch(this.webgl.$subtitles.currentPart, this.onPartChange.bind(this));
	}

	onPartChange(part) {
		console.log('ON PART CHANGE');

		this.hide();

		if (part.length) {
			this.t.edit(part);
			this.show();
		}
	}

	show() {
		this.t.base.visible = true;
	}

	hide() {
		console.log('SUBTITLE HIDE');
		this.t.base.visible = false;
	}
}
