import { prng } from '#utils/maths/prng.js';
import { webgl } from '#webgl/core';
import { Audio } from 'three';
import { BaseAudio } from './BaseAudio';

const randomArray = (arr) => arr[prng.randomInt(0, arr.length)];

const createPool = (audio, size) => {
	const pool = [];
	for (let i = 0; i < size; i++) {
		const a = new Audio(webgl.$audioListener);
		a.setBuffer(audio.buffer);
		pool.push(a);
	}
	return pool;
};

export class SfxAudio extends BaseAudio {
	constructor(id, audios, opts = {}) {
		audios = Array.isArray(audios) ? audios : [audios];
		audios = audios.map((audio) => createPool(audio, opts.poolSize || 10)).flat();

		// Use the first audio as the main audio
		const audio = audios[0];
		super(id, audio);

		this.variations = audios;
	}

	async play(opts = {}) {
		const audio = this.getRandomButNotCurrents();
		return super.play({ ...opts, audio });
	}

	getRandomButNotCurrents() {
		const currents = this.actives;
		const free = this.variations.filter((a) => !currents.includes(a));
		return randomArray(free);
	}
}
