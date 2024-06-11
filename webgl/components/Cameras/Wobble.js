import { getWebGL } from '#webgl/core/index.js';
import { Vector3 } from 'three';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';

export default class Wobble {
	constructor(position) {
		this.webgl = getWebGL();

		this.position = position;
		this.origin = new Vector3();
		this.target = new Vector3();
		this.perlin = new ImprovedNoise();
		this.frequency = new Vector3(0.6, 0.6, 0.6);
		this.amplitude = new Vector3(0.2, 0.3, 0.1);
		this.scale = 1;
		this.lerpSpeed = 0.02;

		this.forcedY = this.position.clone().y;

		// if (this.position) this.origin.copy(this.position);
	}

	/// #if __DEBUG__
	devtools(gui) {
		const $gui = gui.addFolder({ title: 'Wobble' });

		$gui.addInput(this, 'frequency', { min: 0, max: 10, step: 0.1 });
		$gui.addInput(this, 'amplitude', { min: 0, max: 10, step: 0.1 });
		$gui.addInput(this, 'scale', { min: 0, max: 10, step: 0.1 });
		$gui.addInput(this, 'lerpSpeed', { min: 0, max: 1, step: 0.01 });
	}
	/// #endif

	update(time) {
		this.target.x =
			this.perlin.noise(time * this.frequency.x, 1, 1) * this.amplitude.x;
		this.target.y =
			this.perlin.noise(1, time * this.frequency.y, 1) * this.amplitude.y;
		this.target.z =
			this.perlin.noise(1, 1, time * this.frequency.z) * this.amplitude.z;

		this.target.multiplyScalar(this.scale);
		this.target.add(this.position);
		// this.target.add(this.origin);

		const { stableDt: dt } = this.webgl.$time;
		this.position?.damp(this.target, this.lerpSpeed, dt);
	}
}
