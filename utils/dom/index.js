const IS_BROWSER = typeof window !== 'undefined';

// Retrigger a reflow for the specific element.
// We are force to assign to a variable
// to avoid chrome stripping the read instruction
// Thus non-triggering the reflow
let keep = null; // eslint-disable-line no-unused-vars
export function forceReflow(el) { return keep = el.offsetHeight }

// Called when the DOM is ready
export function onDOMReady(cb) {
	// Load app only if this is not an oldBrowser
	// (Mainly used for easy oldBrowser development)
	if (!IS_BROWSER) {
		cb();
	} else if (!window.isOldBrowser) {
		const d = document;
		if (d.readyState[ 0 ] === 'l') {
			d.addEventListener('DOMContentLoaded', cb);
		} else {
			cb();
		}
	}
}

export function autoblurButtons(selector = document) {
	if (autoblurButtons.isSet) return;
	autoblurButtons.__isSet = true;
	selector.addEventListener('mouseup', autoblur, true);

	function autoblur(e) {
		if (!e.target) return
		if ('dataset' in e.target && (
			e.target.dataset?.disableAutoblur
			|| e.target.dataset?.noAutoblur
		)) return;

		if (
			e.target.tagName === 'BUTTON'
		) {
			e.target.blur();
		}
	}

	return function unwatchAutoblurClickedButtons() {
		selector.removeEventListener('mouseup', autoblur, true);
		autoblurButtons.__isSet = false;
	};
}

export * from './useEventListener.js';
