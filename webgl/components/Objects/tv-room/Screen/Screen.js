import { ShaderMaterial, Vector2 } from 'three';
import { BaseInteractiveObject } from '../../base/BaseInteractiveObject';

import fs from './ScreenFs.frag?hotshader';
import vs from './ScreenVs.vert?hotshader';
import BaseComponent from '#webgl/core/BaseComponent.js';

export class Screen extends BaseComponent {
	init() {
		this.mesh = this.props.mesh;

		const { uniforms } = this.webgl;

		this.mesh.material = new ShaderMaterial({
			uniforms: {
				...uniforms,
				uInterferences: { value: new Vector2(2, 0.2) },
				tMap: { value: this.getInstructionsScreen() },
			},
		});

		this.mat = this.mesh.material;
		this.uniforms = this.mat.uniforms;
		fs.use(this.mesh.material);
		vs.use(this.mesh.material);

		this.base = this.mesh;

		this.isSimpleObject = true;
		// this.audioId = 'common/footstep';
	}

	getSplashScreen() {
		return this.webgl.$assets.textures['tv-room']['splash_screen_map'];
	}

	getInstructionsScreen() {
		return this.webgl.$assets.textures['tv-room']['instructions_map'];
	}

	getEndingScreen() {
		return this.webgl.$assets.textures['tv-room']['gobelins_screen_map'];
	}

	setSplashScreen() {
		this.uniforms.tMap.value = this.getSplashScreen();
	}

	setInstructionsScreen() {
		this.uniforms.tMap.value = this.getInstructionsScreen();
	}

	setEndingScreen() {
		this.uniforms.tMap.value = this.getEndingScreen();
	}

	// createSheets() {
	// 	this.$sheet = this.$project.getSheet('read-instructions');
	// 	// this.$sheet.attachAudio(this.audioId);
	// 	this.$sheet.$addCamera();
	// }

	// reset() {
	// 	super.reset();
	// }
}
