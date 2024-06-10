import BaseScene from '#webgl/core/BaseScene.js';
import { MeshBasicMaterial } from 'three';
import { MainCamera } from '../Cameras/MainCamera';
import { Particles } from '../Particles/Particles';

const startValues = {
	uFlowFieldFrequency: 0.15,
	uFlowFieldStrength: 2.3,
	uFlowFieldInfluence: 1.0
}
export default class ParticleScene extends BaseScene {
	mixins = ['debugCamera'];

	init() {
		const { $assets } = this.webgl;
		const boat  = $assets.objects['boat'].scene;
		this.camera = this.add(MainCamera);
		this.camera.base.lookAt(0, 0, 0);
		this.particles = this.add(Particles, {
			instance: boat.children[0].geometry.clone()
		})

	}

	async enter() {
		const { $composer } = this.webgl;
		const glitch = await Promise.all([
			$composer.$crt.unglitch(),
			$composer.$lut.animateSaturation(1),
		])
	}
}
