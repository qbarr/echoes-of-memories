import { raf } from './raf';

class RafTimer {
	constructor(delay, cb, opts = {}) {
		const autostart = opts.autostart !== undefined ? opts.autostart : true;
		this._standalone = opts.standalone !== undefined ? opts.standalone : true;
		this._selfdestruct = opts.selfdestruct !== undefined ? opts.selfdestruct : true;

		this._stopped = true;
		this._remainder = 0;
		this._delay = delay | 0;
		this._remainingTime = delay;
		this._callback = cb === undefined ? function () {} : cb;

		const self = this;
		const update = this.update;
		const restart = this.restart;
		this.update = function (dt) { update.call(self, dt) };
		this.restart = function (n, u) { restart.call(self, n, u) };

		if (autostart) this.start();
		if (this._delay === 0) this.stop();
	}

	setCallback(newCallback, newDelay) {
		this._callback = newCallback === undefined ? function () {} : newCallback;
		if (newDelay) this.restart(newDelay);
	}

	stop() {
		this._stopped = true;
		if (this._standalone) raf.remove(this.update);
	}

	start() {
		if (!this._stopped) return;
		this.restart();
	}

	restart(newDelay, useRemainder) {
		if (useRemainder === void 0) useRemainder = true;
		if (newDelay !== undefined) this._delay = newDelay;
		if (this._standalone && this._stopped) raf.add(this.update);
		this._stopped = false;
		this._remainingTime = this._delay - (this._remainder * (+useRemainder));
	}

	update(dt) {
		if (this._stopped) return;
		this._remainingTime -= dt;
		if (this._remainingTime <= 0) {
			this._stopped = true;
			this._remainder = (-this._remainingTime) % this._delay;
			this._callback(this.restart);
			if (this._stopped && this._selfdestruct) this.dispose();
		} else {
			this._remainder = 0;
		}
	}

	dispose() {
		if (this._standalone) raf.add(this.update);
		this._callback = this.restart = null;
		this.stop();
		this._remainder = 0;
		this._remainingTime = this._delay;
	}
}

export function raftimer(delay, cb, opts) {
	return new RafTimer(delay, cb, opts);
}
