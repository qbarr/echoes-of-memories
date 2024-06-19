import { clamp } from '#utils/maths/map.js';
import { AudioSample } from './AudioSample';
import { BaseAudio } from './BaseAudio';

export class BgmAudio extends BaseAudio {
	constructor(id, audios) {
		audios = Array.isArray(audios) ? audios : [audios];
		// Use the first audio as the main audio
		const audio = audios[0];
		super(id, audio);

		this.layers = audios;
		this.gainNodes = [];
	}

	play(opts = {}) {
		if (this.actives.length > 0) return this.resume();
		for (let i = 0; i < this.layers.length; i++) {
			const layer = this.layers[i];
			const sample = AudioSample.get();
			this.actives.push(sample);
			sample.play(layer, { ...opts, loop: true });
			if (i > 1) sample.setVolume(0);
		}
	}

	// Override
	stop() {} //
	reset() {} //

	pause() {
		this.actives.forEach((audio) => audio.pause());
		return this;
	}

	resume() {
		this.actives.forEach((audio) => audio.resume());
		return this;
	}

	mixLayers(volumes) {
		for (let i = 0; i < this.layers.length; i++) {
			const vol = clamp(volumes[i], 0, 1);
			this.actives[i].setVolume(vol);
		}
	}

	mix(i, volume) {
		volume = clamp(volume, 0, 1);
		this.actives[i].setVolume(volume);
	}
}
