import { easings } from './easings.js';
import { createUID, activeTweens, queue } from './csstween.js';

function getEasing(easing) {
	if (!easing) easing = 'linear';
	if (easings[ easing ]) easing = easings[ easing ];
	return Array.isArray(easing)
		? `cubic-bezier(${ easing.join(',') })`
		: easing;
}

export function cssanimate(props = {}) {
	// Get options
	let onComplete = props.complete;
	let onStart = props.start;
	let target = props.target;
	if (props.selector) target = target.querySelector(props.selector);
	const easing = getEasing(props.ease || props.easing);
	const instant = !!props.instant;
	const useWillChange = !!props.willChange;
	const delay = (props.delay || 0);
	const duration = instant ? '0ms' : (props.duration || 1000);
	const fillMode = props.fillMode || 'forwards';
	const direction = props.direction || 'normal';
	const name = (props.animation || props.name || 'pop');
	const maxDuration = duration + delay;

	const animationString = [
		name,
		duration + 'ms',
		easing,
		delay > 0 ? delay + 'ms' : null,
		1, // iteration count
		direction,
		fillMode
	].filter(v => v !== null).join(' ');

	// Get element uid
	if (!target.dataset.csstween) target.dataset.csstween = createUID();
	const uid = target.dataset.csstween;

	let completePromise = null;
	let finished = new Promise(resolve => completePromise = resolve);
	if (props.queue) props.queue.push(finished);

	const api = { destroy, stop: destroy, finished };
	let emergencyTimer = null;
	let destroyed = false;

	queue(beforeGetBounding, getBounding, afterGetBounding);
	return api;


	function beforeGetBounding() {
		if (destroyed) return;
		// Remove current tween for this target
		if (activeTweens.has(uid)) activeTweens.get(uid).destroy();
		// Register tween
		activeTweens.set(uid, api);
		// Remove previous animation and play new one
		target.style.animation = '';
	}

	function getBounding() {
		if (destroyed || !target) return;
		target.getBoundingClientRect();
	}


	function afterGetBounding() {
		if (destroyed || !target) return;
		target.addEventListener('animationstart', onAnimationStart);
		target.addEventListener('webkitAnimationStart', onAnimationStart);
		target.addEventListener('animationend', onAnimationEnd);
		target.addEventListener('webkitAnimationEnd', onAnimationEnd);

		if (useWillChange) target.style.willChange = 'transform, opacity';
		target.style.animation = animationString;
		// Set an emergency timer
		emergencyTimer = window.setTimeout(finish, maxDuration * 1.1 + 200);
	}

	function finish() {
		if (destroyed) return;
		window.clearTimeout(emergencyTimer);
		if (completePromise) completePromise();
		if (onComplete) onComplete(target);
		destroy();
	}

	function onAnimationStart(e) {
		if (onStart) onStart(target, e);
		onStart = null;
		target.removeEventListener('animationstart', onAnimationStart);
		target.removeEventListener('webkitAnimationStart', onAnimationStart);
	}

	function onAnimationEnd() {
		target.style.willChange = '';
		finish();
	}

	function destroy() {
		if (destroyed) return;
		window.clearTimeout(emergencyTimer);
		emergencyTimer = null;
		target.removeEventListener('animationend', onAnimationEnd);
		target.removeEventListener('webkitAnimationEnd', onAnimationEnd);
		target.removeEventListener('animationstart', onAnimationStart);
		target.removeEventListener('webkitAnimationStart', onAnimationStart);
		activeTweens.delete(uid);
		target = null;
		finished = null;
		onComplete = null;
		onStart = null;
		completePromise = null;
		destroyed = true;
	}
}
