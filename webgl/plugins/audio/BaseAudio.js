import { Audio } from 'three';
import { AudioSample } from './AudioSample';
import { w } from '#utils/state/index.js';

export class BaseAudio {
	constructor(id, audio, type) {
		this.id = id;
		this.audio = audio;
		this.isDeferred = false;
		this.actives = [];

		this.volume = w(1);
		// if (type !== 'bgm') {
		this.volume.watchImmediate((v) => this.setVolume(v));
		// }
	}

	play(opts = {}) {
		const sample = AudioSample.get();
		this.actives.push(sample);

		const a = opts.audio instanceof Audio ? opts.audio : this.audio;
		sample.play(a, {
			_onEnd: () => {
				this.actives = this.actives.filter((a) => a !== sample);
				sample.release();
			},
			...opts,
		});

		return this;
	}

	pause() {
		if (!this.actives.length) return;
		this.actives.forEach((audio) => audio.pause());
		return this;
	}

	resume() {
		if (!this.actives.length) return;
		this.actives.forEach((audio) => audio.resume());
		return this;
	}

	stop() {
		if (!this.actives.length) return;
		this.actives.forEach((audio) => audio.stop());
		return this;
	}

	reset() {
		if (!this.actives.length) return;
		this.actives.forEach((audio) => audio.reset());
		return this;
	}

	seek(time) {
		if (!this.actives.length) return;
		this.actives.forEach((audio) => audio.seek(time));
		return this;
	}

	deferredPlay() {
		if (!this.actives.length) return;
		this.actives.forEach((audio) => audio.deferredPlay());
		return this;
	}

	setVolume(volume) {
		if (!this.actives.length) return;
		this.actives.forEach((audio) => audio.setVolume(volume));
		return this;
	}

	unlockAudioContext() {
		if (!this.isDeferred) return;
		this.actives.forEach((audio) => audio.unlockAudioContext());
		this.isDeferred = false;
		document.removeEventListener('click', this.unlockAudioContext);
		return this;
	}
}
