import { raftween } from '#utils/anim/raftween.js';
import { wait } from '#utils/async/wait.js';
import { damp } from '#utils/maths/map.js';
import { poolify } from '#utils/optims/poolify.js';
import { raf } from '#utils/raf/raf.js';
import { webgl } from '#webgl/core/index.js';
import { wraftween } from '#webgl/utils/wraftween.js';

let uid = 0;
export class AudioSample {
	constructor() {
		this.uid = uid++;
		this.audio = null;
		this.isDeferred = false;
		this.isPlaying = false;
		this.forcePause = false;

		this.currentVolume = 0;
		this.volume = 0;
		this.targetVolume = 1;
		this.tween = null;

		this.bufferStartTime = 0;
		this.bufferPauseTime = 0;

		this.tween = null;
	}

	createVolTween({ volume, duration, onComplete = () => {} }) {
		this.tween?.destroy();
		this.tween = wraftween({
			onUpdate: () => {
				this.setVolume(this.volume);
			},
			onComplete,
		}).to(this, {
			volume: volume ?? this.targetVolume,
			duration,
			easing: 'outSwift',
		});
		return this.tween;
	}

	setAudio(audio) {
		this.audio = audio;
		return this;
	}

	async play(audio, opts = {}) {
		if (!audio && !this.audio) return;
		if (audio) this.audio = audio;

		if (!this.audio) return;

		if (this.isPlaying) {
			if (opts.force) return this.reset().start(opts);
			return this;
		}

		if (opts.delay) await wait(opts.delay);
		if (opts.onStart) opts.onStart();
		if (opts.fade) {
			this.volume = 0;
			this.targetVolume = opts.volume ?? 1;
			this.createVolTween({ duration: opts.fade });
		} else if (opts.volume) {
			this.volume = opts.volume;
			this.targetVolume = opts.volume;
			this.setVolume(opts.volume);
		}

		this.audio.setLoop(!!opts.loop);

		const origOnEnded = this.audio.onEnded;
		this.audio.onEnded = () => {
			if (opts.loop) {
				if (opts.onEndLoop) opts.onEndLoop();
				if (opts.loopCount) opts.loopCount--;
				if (!opts.loopCount || opts.loopCount < 0) return;

				if (opts.loopDelay) {
					this.play({
						...opts,
						delay: opts.loopDelay,
						onStart: opts.onStart,
						onEndLoop: opts.onEndLoop,
						onEnd: opts.onEnd,
						loop: true,
						loopCount: opts.loopCount,
						loopDelay: opts.loopDelay,
						force: true,
					});
				} else {
					this.play({ ...opts, force: true });
				}
			} else {
				this.stop();
				if (opts.onEnd) opts.onEnd();
				if (opts.onComplete) opts.onComplete();
				if (opts._onEnd) opts._onEnd();
				origOnEnded.call(this.audio);
			}
		};

		this.audio.play();
		this.bufferStartTime = 0;
		this.isPlaying = true;
		webgl.$audio.actives.set(this.uid, this);

		return this;
	}

	pauseFromVisibility() {
		this.pause(false);
		return this;
	}

	resumeFromVisibility() {
		if (this.forcePause) return;
		this.resume();
		return this;
	}

	async pause(force = true, { fade = 0 } = {}) {
		if (!this.isPlaying) return;
		this.bufferPauseTime = this.audio.context.currentTime - this.bufferStartTime;
		this.forcePause = force;
		if (fade) {
			this.targetVolume = 0;
			this.volume = this.currentVolume;
			this.createVolTween({
				duration: fade,
				onComplete: () => {
					this.audio.pause();
					this.isPlaying = false;
				},
			});
		} else {
			this.audio.pause();
			this.isPlaying = false;
		}

		return this;
	}

	resume({ fade = 0 } = {}) {
		if (this.isPlaying) return;
		this.bufferStartTime = this.audio.context.currentTime - this.bufferPauseTime;
		this.forcePause = false;
		if (fade) {
			this.targetVolume = this.currentVolume;
			this.createVolTween({ duration: fade });
		}
		this.isPlaying = true;
		this.audio.play();
		return this;
	}

	stop() {
		if (!this.isPlaying) return;
		this.audio.stop();
		this.bufferStartTime = 0;
		this.bufferPauseTime = 0;
		this.audio.offset = 0;
		this.isPlaying = false;
		webgl.$audio.actives.delete(this.uid);
		return this;
	}

	reset() {
		this.stop();
		return this;
	}

	seek(time) {
		// if (time < 0 || time > this.audio.buffer.duration) return;
		// this.audio.stop();
		// this.audio.offset = time;
		// if (this.isPlaying) this.audio.play();
		// else this.bufferPauseTime = time;
		// return this;
	}

	deferredPlay() {
		this.isDeferred = true;
		document.addEventListener('click', this.unlockAudioContext.bind(this));
		return this;
	}

	setVolume(volume, keep = false) {
		this.audio.setVolume(volume);
		if (keep) this.currentVolume = volume;
		return this;
	}

	unlockAudioContext() {
		if (this.audio.context.state === 'suspended') {
			this.audio.context.resume().then(() => {
				if (this.isDeferred) {
					this.play();
					this.isDeferred = false;
				}
				document.removeEventListener('click', this.unlockAudioContext.bind(this));
			});
		} else if (this.isDeferred) {
			this.play();
			this.isDeferred = false;
			document.removeEventListener('click', this.unlockAudioContext.bind(this));
		}
	}
}

poolify(AudioSample, null, 50);
