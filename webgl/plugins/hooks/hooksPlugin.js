import { s } from '#utils/state';
import { capitalize } from '#utils/str';


const NOOP = a => a;

export function hooksPlugin(o) {
	const hooks = {};

	o.$hooks = hooks;
	o.$createHook = createHook;

	function createHook({
		name = 'hook',
		async = false,
		once = false,
		action = NOOP,
		beforeAction = null,
		afterAction = null
	} = {}) {
		const hookSuffix = capitalize(name);
		const hasBeforeAction = !!beforeAction;
		const hasAfterAction = !!afterAction;
		let beforeHook = hooks[ 'before' + hookSuffix ] = s();
		let afterHook = hooks[ 'after' + hookSuffix ] = s();
		hooks[ name ] = async
			? async function (opts) {
				beforeHook.emit();
				if (hasBeforeAction) beforeAction();
				await action(opts);
				if (hasAfterAction) afterAction();
				afterHook.emit();
				if (once) dispose();
			}
			: function (opts) {
				beforeHook.emit();
				if (hasBeforeAction) beforeAction();
				action(opts);
				if (hasAfterAction) afterAction();
				afterHook.emit();
				if (once) dispose();
			};

		hooks[ name ].dispose = dispose;

		function dispose() {
			beforeHook.unwatchAll();
			afterHook.unwatchAll();
			beforeHook = afterHook = null;
			beforeAction = afterAction = null;
			hooks[ name ] = NOOP;
		}
	}

	return {
		install: (webgl) => {
			// webgl.$hooks = hooks;
			// webgl.$createHook = createHook;
		},
		load: () => {}
	}
}
