import { createLogger } from '#utils/debug'
import { w } from '#utils/state'

import { getApp } from '#app/core'
import { getWebgl } from '#webgl/core'


let elapsedTime = 0
const NOOP = v => v

export const createState = (id, state = {}) => ({
	id,
	...createLogger(`State • ${id}`, '#000', '#cbb3ff'),
	isValidChange: () => true,
	enter: NOOP,
	leave: NOOP,
	update: NOOP,
	...state,
	$webgl: getWebgl(),
	$app: getApp(),
	_needsUpdate: false,
})

export class StatesMachine {
	constructor(name = 'null') {
		this.$webgl = getWebgl()
		this.$app = getApp()

		Object.assign(this, createLogger(`States • ${name}`, '#000', '#a880ff'))

		this.states = new WeakMap()
		this.currentState = w(null)
		this.currentState.watch(this.handleStateChange.bind(this))
	}

	getStates() {
		return this.states
	}

	getState(state) {
		return this.states.get(state)
	}

	getCurrentState() {
		return this.currentState.get()
	}

	addState(state, forceId = null) {
		const id = forceId ?? state.id
		const s = createState(id, state)
		this.states.set(id, s)
		return s
	}

	setState(stateId, force = false) {
		const state = this.getState(stateId)
		if (!state) return
		if (
			!this.checkValidChange(this.getCurrentState(), state)
			&& !force
		) return

		this.currentState.set(state, force)
	}

	update() {
		const state = this.getCurrentState()
		if (!state) return
		if (!state._needsUpdate) return

		const { dt, et } = this.$webgl.$time
		elapsedTime += dt

		state?.update({ machine: this, dt, et, etFromStart: elapsedTime })
	}

	checkValidChange(from, to) {
		if (!from) return true
		if (!to) return false
		return from.isValidChange(to)
	}

	async handleStateChange(curr, prev) {
		if (prev) prev._needsUpdate = false
		elapsedTime = 0
		await prev?.leave({ machine: this, to: curr })
		await curr?.enter({ machine: this, from: prev })
		if (curr) curr._needsUpdate = true
	}
}
