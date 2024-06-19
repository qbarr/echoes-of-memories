import { createLogger } from '#utils/debug';
import { w } from '#utils/state';

import { getApp } from '#app/core';
import { getWebGL } from '#webgl/core';

let elapsedTime = 0; // elapsed time since the last state change
const NOOP = (v) => v;

export const createState = (id, state = {}) => ({
	isValidChange: () => true,
	enter: NOOP,
	leave: NOOP,
	update: NOOP,
	...state,
	id,
	symbol: Symbol(id),
	...createLogger(`State • ${id}`, '#000', '#cbb3ff'),
	$webgl: getWebGL(),
	$app: getApp(),
	_et: 0,
	_needsUpdate: true,
	_isCanceled: false,
});

export class StatesMachine {
	constructor(id, { states = [], ...args } = {}) {
		this.$webgl = getWebGL();
		this.$app = getApp();

		Object.assign(this, createLogger(`States • ${id}`, '#000', '#a880ff'));

		this.id = id;
		this._symbols = {};
		this._states = new Map();
		this._currentState = w(null);
		this._currentState.watch(this.handleStateChange.bind(this));
		this._args = args ?? {};

		states.forEach((state) => this.registerState(state));

		this.set = this.setState;
	}

	get currentState() {
		return this._currentState.get();
	}

	get states() {
		return this._states;
	}

	getState(id) {
		return this.states.get(this._symbols[id]);
	}

	is(state) {
		if (typeof state === 'string') return this.currentState.id === state;
		return this.currentState === state;
	}

	registerState(state) {
		const id = state.forceId ?? state.id;
		const s = createState(id, { ...state, ...this._args });
		this.states.set(s.symbol, s);
		this._symbols[id] = s.symbol;
		return s;
	}

	setState(stateId, force = false) {
		const state = this.getState(stateId);
		if (!state) return;
		if (!this.checkValidChange(this.currentState, state) && !force) return;

		this._currentState.set(state, force);
	}

	update() {
		const state = this.currentState;
		if (!state) return;
		if (!state._needsUpdate) return;

		const { dt, et } = this.$webgl.$time;
		state._et += dt;
		state.update({ machine: this, dt, et, etFromStart: state._et });
	}

	checkValidChange(from, to) {
		if (!from) return true;
		if (!to) return false;
		return from.isValidChange(to);
	}

	// Check if the state is canceled
	// Useful to prevent async operations from the previous state to continue
	isCanceled(s) {
		return !this.is(s) || s._isCanceled;
	}

	async handleStateChange(curr, prev) {
		if (prev === curr) prev._isCanceled = curr._isCanceled = true;
		if (prev) {
			await prev.leave({ machine: this, to: curr });
		}
		if (curr) {
			curr._et = 0;
			await curr.enter({
				machine: this,
				from: prev,
				to: curr,
				isCanceled: () => this.isCanceled(curr),
			});
			curr._isCanceled = false;
		}
	}
}
