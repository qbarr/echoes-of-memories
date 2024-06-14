import { raftween } from '#utils/anim';
import { deferredPromise, microdefer } from '#utils/async';
import { fastBind } from '#utils/optims';
import { raf } from '#utils/raf';

const NOOP = () => {};

// Wrapper around raftween to add multi-properties support
class WrafTween {
	constructor({
		manualUpdate = false,
		selfDestruct = true,
		onStart = NOOP,
		onComplete = NOOP,
		onUpdate = NOOP,
	} = {}) {
		this._tweenCache = new Map();
		this._updateTween = fastBind(this._updateTween, this, 1);
		this._resetTween = fastBind(this._resetTween, this, 1);
		this._destroyTween = fastBind(this._destroyTween, this, 1);
		this._manualUpdate = manualUpdate;
		this._selfDestruct = selfDestruct;
		this._destroyed = false;
		this._started = false;
		this._dt = 0;

		this.onStart = onStart;
		this.onComplete = onComplete;
		this.onUpdate = onUpdate;

		this._paused = false;
		this.tweens = new Set();
		this.activeTweens = new Set();
		this.finished = deferredPromise();

		this.scheduleStart = microdefer(this.start, this);
		this.update = fastBind(this.update, this, 1);
	}

	from(target, fromOpts = {}) {
		return this.triggerTween(target, fromOpts, null);
	}

	fromTo(target, fromOpts = {}, toOpts = {}) {
		return this.triggerTween(target, fromOpts, toOpts);
	}

	to(target, toOpts = {}) {
		return this.triggerTween(target, null, toOpts);
	}

	triggerTween(target, fromOpts, toOpts) {
		const mainOpts = toOpts || fromOpts;
		const {
			duration = 1000,
			easing = 'inOutCubic',
			delay = 0,
			onStart = NOOP,
			onProgress = NOOP,
			onComplete = NOOP,
			// Remove these from the properties object
			manualUpdate,
			selfDestruct,
			...properties
		} = mainOpts;

		const fromProperties = mainOpts === toOpts ? fromOpts : properties;
		const toProperties = mainOpts === toOpts ? properties : toOpts;

		if (!this._tweenCache.has(target)) this._tweenCache.set(target, new Map());

		for (const key in properties) {
			// Already tweening code here
			const tween = raftween({
				target,
				property: key,
				from: fromOpts ? fromProperties[key] : undefined,
				to: toOpts ? toProperties[key] : target[key],
				delay,
				duration,
				easing,
				manualUpdate: false,
				selfDestruct: this._selfDestruct,
				onStart,
				onProgress,
				onComplete,
			});

			// Cancel any currently played tween
			// To avoid animation overlapping
			const currentlyPlayedTween = this._tweenCache.get(target).get(key);
			if (currentlyPlayedTween) {
				this._completeTween(currentlyPlayedTween);
				if (this._selfDestruct) currentlyPlayedTween.destroy();
			}

			// Cache the tween
			this._tweenCache.get(target).set(key, tween);

			this.tweens.add(tween);
			this.activeTweens.add(tween);
		}

		if (!this._started) this.scheduleStart();
		return this;
	}

	start() {
		if (this._started) return;
		this._started = true;
		this.onStart();
		if (!this._manualUpdate) raf.add(this.update);
	}

	play() {
		this._paused = false;
	}

	pause() {
		this._paused = true;
	}

	update(dt) {
		if (this._paused || this._destroyed) return;
		this._dt = dt;
		this.tweens.forEach(this._updateTween);
		this.onUpdate();
	}

	onCompleted() {
		this.finished.resolve();
		this.onComplete();
		if (!this._manualUpdate) raf.remove(this.update);
	}

	reset() {
		if (this._selfDestruct) {
			if (__DEBUG__) console.warn('Cant reset self-destructing tween');
			return;
		}
		if (this._destroyed) {
			if (__DEBUG__) console.warn('Cant reset destroyed tween');
			return;
		}
		this._started = false;
		this.finished = deferredPromise();
		this.activeTweens.clear();
		this._tweenCache.clear();
		this.tweens.forEach(this._resetTween);
		this.scheduleStart();
	}

	destroy() {
		if (this._destroyed) return;
		this._destroyed = true;
		this.tweens.forEach(this._destroyTween);
		this.onStart = this.onComplete = NOOP;
		this._tweenCache.clear();
		this.activeTweens.clear();
		this.tweens.clear();
	}

	_updateTween(tween) {
		tween.update(this._dt);
		if (tween.ended) this._completeTween(tween);
	}

	_completeTween(tween) {
		// On self destruct, we can completely remove the tween from the set
		if (this._selfDestruct) this.tweens.delete(tween);
		this.activeTweens.delete(tween);
		const target = tween.target;
		// Remove the tween from the cache
		const cache = this._tweenCache.get(target);
		if (cache) cache.delete(tween.property);
		if (cache && cache.size === 0) this._tweenCache.delete(target);
		// If there are no more active tweens, the tween group is completed
		if (this.activeTweens.size === 0) this.onCompleted();
	}

	_resetTween(tween) {
		this.activeTweens.add(tween);
		tween.reset();
	}

	_destroyTween(tween) {
		tween.destroy();
	}
}

export const wraftween = (opts) => {
	return new WrafTween(opts);
};

export const delayCall = (delay = 0, fn) => {
	const o = { p: 0 };
	return [
		o,
		{
			p: 1,
			delay: delay,
			duration: 10,
			onStart: () => fn(),
		},
	];
};
