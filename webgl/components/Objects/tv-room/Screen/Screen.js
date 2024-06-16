import { ShaderMaterial } from 'three';
import { BaseInteractiveObject } from '../../base/BaseInteractiveObject';

import fs from './ScreenFs.frag?hotshader';
import vs from './ScreenVs.vert?hotshader';
import BaseComponent from '#webgl/core/BaseComponent.js';

export class Screen extends BaseComponent {
	init() {
		this.mesh = this.props.mesh;

		const { $assets, uniforms } = this.webgl;
		const texture = $assets.textures['tv-room']['instructions_map'];

		this.mesh.material = new ShaderMaterial({
			uniforms: {
				...uniforms,
				tMap: { value: texture },
			},
		});
		fs.use(this.mesh.material);
		vs.use(this.mesh.material);

		this.base = this.mesh;

		this.isSimpleObject = true;
		// this.audioId = 'common/footstep';
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
