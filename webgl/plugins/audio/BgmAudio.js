import { clamp } from '#utils/maths/map.js';
import { AudioSample } from './AudioSample';
import { BaseAudio } from './BaseAudio';

export class BgmAudio extends BaseAudio {
	constructor(id, audios) {
		audios = Array.isArray(audios) ? audios : [audios];
		// Use the first audio as the main audio
		const audio = audios[0];
		super(id, audio, 'bgm');

		this.layers = audios;
		this.layersVolume = this.layers.map(() => 0);
		this.layersVolume[0] = 1;

		for (let i = 0; i < this.layers.length; i++) {
			const layer = this.layers[i];
			const sample = AudioSample.get();
			this.actives.push(sample);
			sample.setAudio(layer);
			sample.setVolume(this.layersVolume[i], true);
			sample.play(null, { loop: true }).then((s) => s.pause());
		}

		this.play = this.resume.bind(this);
	}

	// Override
	stop() {} //
	reset() {} //

	pause() {
		this.actives.forEach((audio) => audio.pause(true, { fade: 1000 }));
		return this;
	}

	resume() {
		this.actives.forEach((audio) => audio.resume({ fade: 1000 }));
		return this;
	}

	mixLayers(volumes) {
		for (let i = 0; i < this.layers.length; i++) {
			const vol = clamp(volumes[i], 0, 1) * this.volume.value;
			this.actives[i].setVolume(vol, true);
		}
	}

	mix(i, volume) {
		volume = clamp(volume, 0, 1) * this.volume.value;
		this.actives[i].setVolume(volume, true);
	}

	setVolume(volume) {
		this.volume.value = volume;
		if (!this.actives.length) return;
		this.mixLayers(this.layersVolume);
	}
}
