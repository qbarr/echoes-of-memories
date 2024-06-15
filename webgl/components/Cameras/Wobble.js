import { damp, lerp } from '#utils/maths/map.js';
import { getWebGL } from '#webgl/core/index.js';
import { Vector3 } from 'three';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';

export default class Wobble {
	constructor({
		position = new Vector3(),
		frequency = new Vector3(),
		amplitude = new Vector3(),
		scale = 1,
	} = {}) {
		this.webgl = getWebGL();

		this.position = position;
		this.origin = new Vector3();
		this.target = new Vector3();
		this.perlin = new ImprovedNoise();
		this.frequency = frequency;
		this.amplitude = amplitude;
		this.scale = scale;
		this.baseLerpSpeed = this.targetLerpSpeed = 0.02;

		this.forcedY = this.position.clone().y;
	}

	/// #if __DEBUG__
	devtools(gui) {
		const $gui = gui.addFolder({ title: 'Wobble' });

		$gui.addInput(this, 'frequency', { min: 0, max: 10, step: 0.1 });
		$gui.addInput(this, 'amplitude', { min: 0, max: 10, step: 0.1 });
		$gui.addInput(this, 'scale', { min: 0, max: 50, step: 0.1 });
		$gui.addInput(this, 'baseLerpSpeed', { min: 0, max: 0.01, step: 0.001 });
	}
	/// #endif

	setTargetLerpSpeed(speed) {
		this.targetLerpSpeed = speed;
	}

	theatreUpdate({ intensity, frequency, amplitude, scale }) {
		this.frequency = frequency;
		this.amplitude = amplitude;
		this.scale = scale;
	}

	update(time) {
		// console.log(this.scale);
		this.baseLerpSpeed = lerp(this.baseLerpSpeed, this.targetLerpSpeed, 0.01);

		this.target.x =
			this.perlin.noise(time * this.frequency.x, 1, 1) * this.amplitude.x;
		this.target.y =
			this.perlin.noise(1, time * this.frequency.y, 1) * this.amplitude.y;
		this.target.z =
			this.perlin.noise(1, 1, time * this.frequency.z) * this.amplitude.z;

		this.target.multiplyScalar(this.scale);
		this.target.add(this.position);

		const { stableDt: dt } = this.webgl.$time;
		this.position?.damp(this.target, this.baseLerpSpeed, dt);
	}
}
