import BaseScene from '#webgl/core/BaseScene.js';
import { Particles } from '../../Particles/Particles';

export default class FlashbackTruckScene extends BaseScene {
	mixins = ['debugCamera'];

	enter() {
		const { $gpgpu, $povCamera, $app } = this.webgl;
		$povCamera.onSceneSwitch(this);
		this.particles = this.add(Particles, {
			gpgpu: $gpgpu.list.get()[1],
			options: {},
		});
		$gpgpu.list.get()[1].forceCompute.set(true)
	}
}
