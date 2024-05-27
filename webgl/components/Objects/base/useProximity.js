import { webgl } from '#webgl/core';

const NOOP = () => {};

const surchargeMethod = (_class, id, cb, before) => {
	const orig = _class[id];
	return (_class[id] = (...args) => {
		if (before) {
			cb();
			orig?.call(_class, ...args);
		} else {
			orig?.call(_class, ...args);
			cb();
		}
	});
};

export function useProximity(Class) {
	function init() {
		console.log('Proximity init', Class);
	}

	function destroy() {}

	surchargeMethod(Class, 'afterInit', init);

	return destroy;
}
