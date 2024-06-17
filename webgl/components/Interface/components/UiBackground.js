import { watch } from 'vue';
import BaseComponent from '#webgl/core/BaseComponent';

import { Object3D, Mesh, MeshBasicMaterial, PlaneGeometry } from 'three';

const defaultOptions = {
	name: 'UiBackground',
	color: 0x000000,
	opacity: 0.5,
};

export class UiBackground extends BaseComponent {
	constructor(props = {}) {
		props = {
			...defaultOptions,
			...props,
		};
		super(props);
		this.base = new Object3D();
		this.base.name = 'UiBackground';

		this.resize = this.resize.bind(this);
	}

	init() {
		const { $viewport, $subtitles } = this.webgl;

		const scene = this.scene ?? this.webgl.$getCurrentScene();
		const camera = scene.getCurrentCamera();
		const { width: camWidth, height: camHeight } = camera.base;

		this.backgrounGeo = new PlaneGeometry(camWidth, camHeight);
		this.backgroundMat = new MeshBasicMaterial({
			transparent: true,
			color: this.props.color,
			opacity: this.props.opacity,
		});
		this.background = new Mesh(this.backgrounGeo, this.backgroundMat);
		this.base.add(this.background);

		$viewport.size.watchImmediate(this.resize);
	}

	resize() {}

	show() {
		thtis.base.visible = true;
	}

	hide() {
		this.base.visible = false;
	}
}
