import { ShaderMaterial, Vector2 } from 'three';

import BaseComponent from '#webgl/core/BaseComponent.js';
import fs from './ScreenFs.frag?hotshader';
import vs from './ScreenVs.vert?hotshader';

export class Screen extends BaseComponent {
	init() {
		this.mesh = this.props.mesh;

		const { uniforms } = this.webgl;

		this.mesh.material = new ShaderMaterial({
			uniforms: {
				...uniforms,
				uScreenInterferences: { value: new Vector2(2, .2) },
				tMap: { value: this.getMap('instructions_map') },
			},
		});

		this.mat = this.mesh.material;
		this.uniforms = this.mat.uniforms;
		fs.use(this.mesh.material);
		vs.use(this.mesh.material);

		this.base = this.mesh;

		this.isSimpleObject = true;
	}

	getMap(id) {
		return this.webgl.$assets.textures['tv-room'][id];
	}

	setSplashScreen() {
		this.uniforms.tMap.value = this.getMap('splash_screen_map');
	}

	setInstructionsScreen() {
		this.uniforms.tMap.value = this.getMap('instructions_map');
	}

	setEndingScreen() {
		this.uniforms.tMap.value = this.getMap('gobelins_screen_map');
	}

	reset() {
		this.setInstructionsScreen();
		this.mesh.material.uniforms.uScreenInterferences.value.set(2, .2);
	}
}
