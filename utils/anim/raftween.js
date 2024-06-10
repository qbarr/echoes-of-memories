import { bezier } from './bezier.js';
import { easings } from './easings.js';


const NOOP = () => {};

class RafTween {
	constructor(opts) {
		this.selfDestruct = opts.selfDestruct === undefined ? true : opts.selfDestruct;
		this.onStart = opts.onStart || NOOP;
		this.onProgress = opts.onProgress || NOOP;
		this.onComplete = opts.onComplete || NOOP;

		this.time = 0;
		this.progress = 0;
		this.delay = opts.delay || 0;
		this.duration = opts.duration || 1000;
		this.initialDelay = this.delay;
		this.initialDuration = this.duration;

		this.target = opts.target;
		this.property = opts.property;
		this.method = opts.method;

		this.from = this.to = this.delta = this.current = 0;
		this.setFromTo(opts.from, opts.to);

		if (opts.bezier) {
			this.ease = opts.bezier;
		} else {
			this.ease = opts.easing
				? Array.isArray(opts.easing)
					? bezier(opts.easing)
					: bezier(easings[ opts.easing ])
				: bezier(easings.inOutQuart);
		}

		this.paused = !!opts.paused;
		this.ended = false;
		this.finished = new Promise(resolve => this.resolve = resolve);
	}

	setFromTo(from, to) {
		this.from = from !== undefined ? from : this.target[ this.property ];
		this.to = to !== undefined ? to : from;
		this.delta = this.to - this.from;
		this.current = this.from;
	}

	reset() {
		this.time = 0;
		this.progress = 0;
		this.delay = this.initialDelay;
		this.duration = this.initialDuration;
		this.ended = false;
		this.finished = new Promise(resolve => this.resolve = resolve);
		this.play();
	}

	play() {
		this.paused = false;
	}

	pause() {
		this.paused = true;
	}


	update(dt) {
		if (this.paused || this.ended || this.destroyed) return;
		if (this.delay > 0) {
			this.delay -= dt;
			if (this.delay <= 0) {
				dt = Math.abs(this.delay);
				this.onStart(this.progress, this.current, dt);
			} else {
				dt = 0;
			}
		}

		this.time += dt;
		this.progress = Math.max(0, Math.min(this.time / this.duration, 1));

		if (this.progress === 0) this.current = this.from;
		else if (this.progress === 1) this.current = this.to;
		else this.current = this.from + this.delta * this.ease(this.progress);

		if (this.target) {
			if (this.property) this.target[ this.property ] = this.current;
			else if (this.method) this.target[ this.method ](this.current);
		}

		this.onProgress(this.progress, this.current, dt);

		if (this.progress >= 1) {
			this.paused = true;
			this.ended = true;
			this.resolve();
			if (this.onComplete) this.onComplete();
			if (this.selfDestruct) this.destroy();
		}
	}

	destroy() {
		if (this.destroyed) return;
		this.destroyed = true;
		this.paused = true;
		this.target = undefined;
		this.onStart = undefined;
		this.onComplete = undefined;
		this.onProgress = undefined;
		this.finished = undefined;
	}
}

export function raftween(opts) {
	return new RafTween(opts);
}
