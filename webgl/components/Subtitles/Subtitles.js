import { watch } from 'vue';

import { Color, Object3D } from 'three';

import BaseComponent from '#webgl/core/BaseComponent';

import { MSDFTextMesh } from '../Text';
import { clampedMap, map } from '#utils/maths/map.js';

export class Subtitles extends BaseComponent {
	constructor(props = {}) {
		super(props);
		this.base = new Object3D();
	}

	init() {
		const baseScale = 0.5;

		this.text = this.add(MSDFTextMesh, {
			name: 'Subtitles',
			font: 'VCR_OSD_MONO',
			content: 'lorem ipsum dolot sit amet',
			centerMesh: { x: true, y: false },
			align: 'center',
			color: new Color(0xffd700).offsetHSL(0, 0.3, 0.1),
		});
		this.hide();

		// this.text.scale.set(baseScale, baseScale, 1);
		this.text.position.set(0, -23, 0);

		const { $viewport, $subtitles } = this.webgl;

		// Pas super propre, à revoir
		$viewport.size.watchImmediate((size) => {
			const scale = clampedMap(size.x, 375, 1680, 0.6, 1) * baseScale;
			this.text.scale.set(scale, scale, 1);
			const dprWidth = size.x * $viewport.pixelRatio.value;
			const mult = clampedMap(size.x, 375, 1680, 0.8, 0.4);
			this.text.updateGeo({ width: dprWidth * mult });
		});

		watch($subtitles.currentPart, this.onPartChange.bind(this));
	}

	onPartChange(part) {
		console.log(part, part.length);
		this.hide();

		if (part.length) {
			this.text.edit(part);
			this.show();
		}
	}

	show() {
		this.text.base.visible = true;
	}

	hide() {
		this.text.base.visible = false;
	}
}
