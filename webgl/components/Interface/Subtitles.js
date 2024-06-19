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
		this.default_part = 'LOREM IPSUM DOLOR SIT AMET. ';
		this.caps = props.caps ?? true;
	}

	init() {
		this.text = this.add(MSDFTextMesh, {
			name: 'Subtitles',
			font: 'VCR_OSD_MONO',
			content: this.default_part,
			centerMesh: { x: true, y: false },
			align: 'center',
			color: new Color(0xffd700).offsetHSL(0, 0.3, 0.1),
		});
		this.setColor = this.text.setColor.bind(this.text);
		this.text.position.set(0, -23, 0);

		const backgroundGeo = new PlaneGeometry(1, 3, 16, 16);
		const backgroundMat = new MeshBasicMaterial({
			color: 0x000000,
			transparent: true,
			opacity: 0.5,
		});
		this.background = new Mesh(backgroundGeo, backgroundMat);
		this.base.add(this.background);
	}

	afterInit() {
		const { $viewport, $subtitles } = this.webgl;

		$viewport.size.watchImmediate(() => {
			this.responsiveTextScale($viewport.size.value);
			this.matchPartWidthToBackgroundSize({
				part: this.default_part,
				width: this.text.geo._layout.width,
				height: this.text.geo._layout.height,
			});
		});
		this.hide();

		$subtitles.currentPart.watch(this.onPartChange.bind(this));
		$subtitles.enabled.watchImmediate((enabled) => {
			enabled ? this.show() : this.hide();
		});
	}

	// Pas super propre, à revoir aussi lol
	matchPartWidthToBackgroundSize({ part, width, height }) {
		const { $viewport, $getCurrentScene } = this.webgl;
		const { x: vw, y: vh } = $viewport.size.value;
		const line_count = this.text.geo._layout._linesTotal;

		const scene = this.scene ?? this.webgl.$getCurrentScene();
		const camera = scene.getCurrentCamera();
		const { width: camWidth } = camera.base;

		const scale = clampedMap(vw, 375, 1680, 0.6, 1) * this.baseScale;

		const mappedScaleX = camWidth * scale + (camWidth / 1.5) * scale;

		const scaleX = line_count > 1 ? mappedScaleX : part.length * 1.235;

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
		if (!this.webgl.$subtitles.enabled.value) return;

		this.hide();

		if (part?.length) {
			if (this.caps) {
				part = part
					.toUpperCase()
					.normalize('NFD')
					.replace(/[\u0300-\u036f]/g, '');
			}
			this.text.edit(part);
			this.matchPartWidthToBackgroundSize({
				part,
				width: this.text.geo._layout.width,
				height: this.text.geo._layout.height,
			});
			this.show();
		}
	}

	show() {
		if (!this.webgl.$subtitles.currentPart.value) return;
		this.background.visible = true;
		this.text.base.visible = true;
	}

	hide() {
		this.background.visible = false;
		this.text.base.visible = false;
	}
}
