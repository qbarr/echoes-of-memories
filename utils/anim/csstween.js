import { easings } from './easings.js';

let uuid = 0;
export const createUID = () => ++uuid;

const def = (prop, common) => prop !== undefined ? prop : common;
const willChangeProps = new Set([ 'opacity', 'transform' ]);
const reservedProps = new Set([ 'target', 'ease', 'duration', 'delay', 'willChange' ]);

export const activeTweens = new Map();

// Deffer DOM read and writes
const beforeBoundings = [];
const boundings = [];
const afterBoundings = [];
let playCalled = false;

function playQueue() {
	let i, l;
	for (i = 0, l = beforeBoundings.length; i < l; i++) beforeBoundings[ i ]();
	for (i = 0, l = boundings.length; i < l; i++) boundings[ i ]();
	for (i = 0, l = afterBoundings.length; i < l; i++) afterBoundings[ i ]();
	beforeBoundings.length = 0;
	boundings.length = 0;
	afterBoundings.length = 0;
	playCalled = false;
}

const defferPlayQueue = typeof window.queueMicrotask === "function"
	? () => queueMicrotask(playQueue)
	: () => Promise.resolve().then(playQueue);

function callPlayQueue() {
	if (playCalled) return;
	playCalled = true;
	defferPlayQueue();
}

export const queue = function (before, bounding, after) {
	if (before) beforeBoundings.push(before);
	if (bounding) boundings.push(bounding);
	if (after) afterBoundings.push(after);
	callPlayQueue();
};

function transition(prop, duration = 1000, easing = 'linear', delay = 0) {
	if (easings[ easing ]) easing = easings[ easing ];
	const ease = Array.isArray(easing)
		? `cubic-bezier(${ easing.join(',') })`
		: easing;

	return `${ prop } ${ duration }ms ${ ease } ${ delay }ms`;
}

export function csstween(props = {}) {
	// Gather options
	let onComplete = props.complete;
	const instant = !!props.instant;
	const useWillChange = !!props.willChange;
	let target = props.target;
	if (props.selector) target = target.querySelector(props.selector);

	const common = {
		easing: props.ease || props.easing || 'linear',
		duration: props.duration || 1000,
		delay: props.delay || 0
	};

	// Get element uid
	if (!target.dataset.csstween) target.dataset.csstween = createUID();
	const uid = target.dataset.csstween;

	let completePromise = null;
	let finished = new Promise(resolve => completePromise = resolve);

	if (props.queue) props.queue.push(finished);

	const api = { destroy, stop: destroy, finished };
	const activeProps = new Set();

	let emergencyTimer = null;
	let destroyed = false;

	// ---- PLAY
	const willChangeEls = [];
	const transitions = [];
	const from = {};
	const to = {};

	let maxDuration = 0;

	// COMPUTE TWEEN
	for (const propname in props) {
		if (reservedProps.has(propname)) continue;
		else if (target.style[ propname ] === undefined) continue;

		const el = props[ propname ];

		if (el === null || el === undefined) continue;

		const prop = typeof el === 'object' && !Array.isArray(el)
			? el
			: { value: el };

		// Append transition settings
		const duration = def(prop.duration, common.duration);
		const delay = def(prop.delay, common.delay);
		const ease = def(prop.easing, common.easing);
		transitions.push(transition(propname, duration, ease, delay));

		maxDuration = Math.max(maxDuration, duration + delay);

		// Create from / to values
		const value = Array.isArray(prop.value)
			? prop.value
			: [ null, prop.value ];

		// Handle instant tweens
		if (
			instant ||
				(delay <= 0 && (!duration || duration <= 0))
		) {
			value[ 0 ] = value[ 1 ];
			value[ 1 ] = null;
		}

		if (value[ 0 ] !== null) from[ propname ] = value[ 0 ];
		if (value[ 1 ] !== null) to[ propname ] = value[ 1 ];

		if (willChangeProps.has(propname)) willChangeEls.push(propname);
	}

	// PLAY TWEEN
	queue(beforeGetBounding, getBounding, afterGetBounding);
	return api;

	function beforeGetBounding() {
		if (destroyed) return;

		// Remove current tween for this target
		if (activeTweens.has(uid)) activeTweens.get(uid).destroy();

		// Register tween
		activeTweens.set(uid, api);

		// Remove previous animation
		target.style.animation = '';

		// Prepare will change if needed
		if (useWillChange && willChangeEls.length > 0) {
			target.style.willChange = willChangeEls.join(', ');
		}

		// From tween
		if (Object.keys(from).length > 0) {
			for (const prop in from) target.style[ prop ] = from[ prop ];
		}
	}

	function getBounding() {
		if (destroyed) return;
		target.getBoundingClientRect();
	}

	function afterGetBounding() {
		if (destroyed) return;

		if (Object.keys(to).length > 0) {
			target.style.transition = transitions.join(', ');

			for (const prop in to) {
				target.style[ prop ] = to[ prop ];
				activeProps.add(prop);
			}

			target.addEventListener('transitionend', onTransitionEnd);
			target.addEventListener('webkitTransitionEnd', onTransitionEnd);
			emergencyTimer = window.setTimeout(finish, maxDuration * 1.1 + 200);
		} else {
			finish();
		}
	}

	function finish() {
		if (destroyed) return;
		window.clearTimeout(emergencyTimer);
		if (onComplete) onComplete();
		completePromise();
		destroy();
	}

	function onTransitionEnd(e) {
		target.style.willChange = '';
		activeProps.delete(e.propertyName);
		if (activeProps.size < 1) finish();
	}

	function destroy() {
		if (destroyed) return;
		window.clearTimeout(emergencyTimer);
		emergencyTimer = null;
		target.style.transition = '';
		target.style.animation = '';
		target.removeEventListener('transitionend', onTransitionEnd);
		target.removeEventListener('webkitTransitionEnd', onTransitionEnd);
		activeTweens.delete(uid);
		activeProps.clear();
		target = null;
		finished = null;
		onComplete = null;
		completePromise = null;
		destroyed = true;
	}
}
