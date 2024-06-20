import { clamp, damp, lerp } from '#utils/maths/map.js';
import { getWebGL } from '#webgl/core/index.js';
import { Vector3 } from 'three';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';

import { w } from '#utils/state/index.js';

export default class Wobble {
	constructor({
		walksSettings = {},
		position = new Vector3(),
		frequency = new Vector3(),
		amplitude = new Vector3(),
		scale = 0.1,
	} = {}) {
		this.webgl = getWebGL();

		this.walksSettings = walksSettings;

		this.position = position;
		this.origin = new Vector3();
		this.target = new Vector3();
		this.perlin = new ImprovedNoise();
		this.frequency = frequency;
		this.amplitude = amplitude;
		this.scale = scale;
		this.baseLerpSpeed = this.targetLerpSpeed = 0.02;

		this.forcedY = this.position.clone().y;

		this.rawStates = ['DEFAULT', 'WALK', 'SHAKE'];
		this.states = this.rawStates.reduce((acc, key) => {
			acc[key] = key;
			return acc;
		}, {});
		this.state = w(this.states.DEFAULT);
		// this.state = w(this.states.WALK);
		this.state.is = (s) => this.state.value.toLowerCase() === s.toLowerCase();
	}

	setMode(_mode) {
		const mode = _mode.toLowerCase();
		if (mode === 'default') goFreeMode();
		else if (mode === 'walk') goWalkMode();
		else if (mode === 'shake') gotToShakeMode();
	}

	goDefaultMode() {
		this.state.set(this.states.DEFAULT);
	}

	goWalkMode() {
		this.state.set(this.states.WALK);
	}

	gotToShakeMode() {
		this.state.set(this.states.SHAKE);
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
		if (this.state.is(this.states.DEFAULT)) this.updateDefaultWobble(time);
		// if (this.state.is(this.states.WALK)) this.updateWalkWobble(time);
	}

	updateDefaultWobble(time) {
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

	updateWalkWobble(time) {
		// this.baseLerpSpeed = lerp(this.baseLerpSpeed, 1, 0.01);

		// console.log(this.baseLerpSpeed);

		const { velocityLength } = this.walksSettings;
		// const v = clamp(velocityLength * 0.05, 0, 50);
		const v = clamp(velocityLength, 1, 50) * 0.1;

		// console.log(v);

		this.target.x = this.target.z = 0;
		this.target.y = Math.sin(time * 10) * v;

		console.log(this.target.y);

		this.target.add(this.position);

		const { stableDt: dt } = this.webgl.$time;
		this.position.damp(this.target, 0.1, dt);
	}
}
