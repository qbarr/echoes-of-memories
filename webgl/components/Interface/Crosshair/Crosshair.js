import BaseComponent from '#webgl/core/BaseComponent.js';
import { AdditiveBlending, Mesh, PlaneGeometry, ShaderMaterial } from 'three';

import fs from './Crosshair.frag?hotshader';
import vs from './Crosshair.vert?hotshader';

export class Crosshair extends BaseComponent {
	init() {
		const t = this.webgl.$assets.textures.interface;
		this.cursors = {
			eye: t.eye,
			pointer: t.pointer,
			door: t.door,
		};
		const planeGeo = new PlaneGeometry(1, 1);
		const planeMat = new ShaderMaterial({
			uniforms: {
				tMap: { value: this.cursors.pointer },
			},
			transparent: true,
			// blending: AdditiveBlending,
		});
		this.mat = planeMat;
		fs.use(planeMat);
		vs.use(planeMat);

		this.base = new Mesh(planeGeo, planeMat);
		this.base.scale.setScalar(2);
		this.base.position.set(0, 0, -0.5);

		// const { isPaused } = this.webgl.$app.$store;
		// watch(this.webgl.$app.$store.isPaused, (paused) => {
		// 	console.log('isPaused:', paused);
		// 	this.setVisible(!paused);
		// });
	}

	toggleHover(hover) {
		this.mat.uniforms.tMap.value = hover ? this.cursors.eye : this.cursors.pointer;
	}

	hoverDoor() {
		this.mat.uniforms.tMap.value = this.cursors.door;
	}

	hoverObject() {
		this.mat.uniforms.tMap.value = this.cursors.eye;
	}

	setVisible(visible) {
		this.base.visible = visible;
	}
}
