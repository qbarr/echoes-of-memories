import { debounce } from './debounce.js';

export function throttle(fn, delay, opts) {
	return debounce(fn, delay, opts, true);
}
