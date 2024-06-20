import BaseScene from '#webgl/core/BaseScene.js';
import { Particles } from '../../Particles/Particles';

export default class FlashbackWarScene extends BaseScene {
	mixins = ['debugCamera'];

	enter() {
		const { $gpgpu, $povCamera, $app } = this.webgl;
		$povCamera.onSceneSwitch(this);
		this.particles = this.add(Particles, {
			gpgpu: $gpgpu.list.get()[2],
			options: {},
		});
		$gpgpu.list.get()[2].forceCompute.set(true)
	}

	leave() {
		const { $gpgpu } = this.webgl;
		$gpgpu.list.get()[2].forceCompute.set(false)
	}
}
