import BaseScene from '#webgl/core/BaseScene.js';
import { MeshBasicMaterial } from 'three';
import { MainCamera } from '../Cameras/MainCamera';
import { Particles } from '../Particles/Particles';

export default class ParticleScene extends BaseScene {
	mixins = ['debugCamera'];

	init() {
		const { $assets } = this.webgl;
		const boat  = $assets.objects['boat'].scene;
		this.base.add(boat);
		this.camera = this.add(MainCamera);
		this.particles = this.add(Particles, {
			instance: boat.children[0].geometry.clone(),
		})

	}

	async enter() {
		const { $composer } = this.webgl;
		// setTimeout(() => {
		// 	$composer.passes[3]?.unglitch()
		// }, 2000);
	}


	async beforeLeave() {

	}
}
