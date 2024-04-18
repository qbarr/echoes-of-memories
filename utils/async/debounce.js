export function debounce(fn, delay = 1, opts = {}, throttle) {
	const thisArg = opts.bind || null;
	const trail = opts.trail != null ? !!opts.trail : true;
	const tail = opts.tail != null ? !!opts.tail : true;

	let pa1, pa2, pa3; // proxy args
	let timeout = null;
	let needTrail = trail;
	let needTailCall = false;

	function delayed() {
		timeout = null;
		if (trail && !needTailCall) {
			needTrail = true;
		}

		fn.call(thisArg, pa1, pa2, pa3);

		if (throttle && needTailCall && tail) {
			needTailCall = false;
			timeout = setTimeout(delayed, delay);
		}
	}

	return function (a1, a2, a3) {
		if (!throttle) {
			clearTimeout(timeout);
			timeout = null;
		}

		pa1 = a1;
		pa2 = a2;
		pa3 = a3;

		if (trail && needTrail) {
			needTrail = false;
			fn.call(thisArg, pa1, pa2, pa3);
		}

		if (timeout === null) {
			timeout = setTimeout(delayed, delay);
		} else if (throttle) {
			needTailCall = true;
		}
	};
}
