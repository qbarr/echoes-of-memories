import { watch } from 'vue';

import { Color, Object3D, PlaneGeometry, MeshBasicMaterial, Mesh } from 'three';

import BaseComponent from '#webgl/core/BaseComponent';

import { MSDFTextMesh } from '../Text';
import { clampedMap, map } from '#utils/maths/map.js';
import { Vector3 } from 'three';

export class Subtitles extends BaseComponent {
	constructor(props = {}) {
		super(props);
		this.base = new Object3D();
		this.baseScale = 0.5;
	}

	init() {
		const default_part = 'LOREM IPSUM DOLOR SIT AMET. ';

		this.text = this.add(MSDFTextMesh, {
			name: 'Subtitles',
			font: 'VCR_OSD_MONO',
			content: default_part,
			centerMesh: { x: true, y: false },
			align: 'center',
			color: new Color(0xffd700).offsetHSL(0, 0.3, 0.1),
		});
		this.text.position.set(0, -23, 0);

		const backgroundGeo = new PlaneGeometry(1, 3, 16, 16);
		const backgroundMat = new MeshBasicMaterial({
			color: 0x525252,
			transparent: true,
			opacity: 0.5,
		});
		this.background = new Mesh(backgroundGeo, backgroundMat);
		this.base.add(this.background);

		this.matchPartWidthToBackgroundSize({
			part: default_part,
			width: this.text.geo._layout.width,
			height: this.text.geo._layout.height,
		});
		this.hide();

		const { $viewport, $subtitles } = this.webgl;
		$viewport.size.watchImmediate(this.responsiveTextScale.bind(this));
		watch($subtitles.currentPart, this.onPartChange.bind(this));
	}

	matchPartWidthToBackgroundSize({ part, width, height }) {
		const { $viewport } = this.webgl;
		const { x: vw, y: vh } = $viewport.size.value;
		const line_count = this.text.geo._layout._linesTotal;

		const scaleX = line_count > 1 ? 70 : part.length * 1.25;

		const { x, y, z } = this.text.position;
		this.background.position.set(x, y, z - 1);
		this.background.position.add(new Vector3(0, line_count / 1.25, 0));
		this.background.scale.set(scaleX, line_count, 1);
	}

	// Pas super propre, à revoir
	responsiveTextScale(size) {
		const { $viewport } = this.webgl;

		const scale = clampedMap(size.x, 375, 1680, 0.6, 1) * this.baseScale;
		this.text.scale.set(scale, scale, 1);
		const dprWidth = size.x * $viewport.pixelRatio.value;
		const mult = clampedMap(size.x, 375, 1680, 0.8, 0.4);
		this.text.updateGeo({ width: dprWidth * mult });
	}

	onPartChange(part) {
		this.hide();

		if (part.length) {
			this.text.edit(part);
			// console.log(this.text.geo._layout);
			this.matchPartWidthToBackgroundSize({
				part,
				width: this.text.geo._layout.width,
				height: this.text.geo._layout.height,
			});
			this.show();
		}
	}

	show() {
		this.background.visible = true;
		this.text.base.visible = true;
	}

	hide() {
		this.background.visible = false;
		this.text.base.visible = false;
	}
}
