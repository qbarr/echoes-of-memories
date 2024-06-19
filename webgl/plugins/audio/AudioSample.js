import { wait } from '#utils/async/wait.js';
import { poolify } from '#utils/optims/poolify.js';
import { webgl } from '#webgl/core/index.js';

let uid = 0;
export class AudioSample {
	constructor() {
		this.uid = uid++;
		this.audio = null;
		this.isDeferred = false;
		this.isPlaying = false;
		this.forcePause = false;

		this.bufferStartTime = 0;
		this.bufferPauseTime = 0;
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
		if (opts.volume) this.setVolume(opts.volume);
		if (opts.onStart) opts.onStart();

		this.audio.play();
		this.bufferStartTime = 0;
		this.isPlaying = true;
		webgl.$audio.actives.set(this.uid, this);
		const origOnEnded = this.audio.onEnded;

		this.audio.setLoop(!!opts.loop);
		this.audio.onEndLoop;
		this.audio.onEnded = () => {
			if (opts.loop) {
				if (opts.onEndLoop) opts.onEndLoop();
				if (opts.loopCount) opts.loopCount--;
				console.log('loopCount', opts.loopCount);
				console.log(!opts.loopCount || opts.loopCount < 0);
				if (!opts.loopCount || opts.loopCount < 0) return;
				console.log('here');

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
				if (opts._onEnd) opts._onEnd();
				origOnEnded.call(this.audio);
			}
		};

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

	pause(force = true) {
		if (!this.isPlaying) return;
		this.bufferPauseTime = this.audio.context.currentTime - this.bufferStartTime;
		this.forcePause = force;
		this.audio.pause();
		this.isPlaying = false;
		return this;
	}

	resume() {
		if (this.isPlaying) return;
		this.bufferStartTime = this.audio.context.currentTime - this.bufferPauseTime;
		this.forcePause = false;
		this.audio.play();
		this.isPlaying = true;
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

	setVolume(volume) {
		this.audio.setVolume(volume);
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
