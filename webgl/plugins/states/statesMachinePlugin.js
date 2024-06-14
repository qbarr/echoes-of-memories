import { StatesMachine } from './StatesMachine.js';

const ALL_STATES = Object.entries(import.meta.glob('./**/*.js', { eager: true })).reduce(
	(acc, [key, value]) => {
		if (key.includes('StatesMachine.js')) return acc;
		const parent = key.split('/').slice(-2)[0];
		const name = key.split('/').slice(-1)[0].replace('.js', '');
		acc[parent] = acc[parent] ?? {};
		acc[parent][name] = {
			...value.default,
			id: name,
		};
		return acc;
	},
	{},
);

export function statesMachinePlugin(webgl) {
	const statesMachines = new Map();
	const symbols = {};

	const api = {
		states: ALL_STATES,
		get statesMachines() {
			return statesMachines;
		},
		create,
		get,
	};

	function create(id, { filter = null } = {}) {
		if (!id) return;

		const states = Object.values(ALL_STATES[filter ?? id] ?? {});

		const sm = new StatesMachine(id, { states });
		const symbol = Symbol(id);
		statesMachines.set(symbol, sm);
		symbols[id] = symbol;

		return sm;
	}

	function get(id) {
		return statesMachines.get(symbols[id]);
	}

	function update() {
		statesMachines.forEach((sm) => sm.update());
	}

	/// #if __DEBUG__
	function devtool() {
		const gui = webgl.$gui.addFolder({ title: 'States Machines' });
	}
	/// #endif

	return {
		install: (webgl) => {
			webgl.$statesMachine = api;
			webgl.$states = api.statesMachines;
			webgl.$getState = get;

			__DEBUG__ && devtool();
		},
		load: () => {
			webgl.$hooks.beforeStart.watchOnce(() =>
				webgl.$hooks.beforeUpdate.watch(update),
			);
		},
	};
}
