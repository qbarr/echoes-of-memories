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

	function create(id, { filter = null, ...args } = {}) {
		if (!id) return;

		const states = Object.values(ALL_STATES[filter ?? id] ?? {});

		const sm = new StatesMachine(id, { states, ...args });
		const symbol = Symbol(id);
		statesMachines.set(symbol, sm);
		symbols[id] = symbol;

		__DEBUG__ && addToGui(sm);

		return sm;
	}

	function get(id) {
		return statesMachines.get(symbols[id]);
	}

	function update() {
		statesMachines.forEach((sm) => sm.update());
	}

	/// #if __DEBUG__
	let $gui = null;
	function devtool() {
		$gui = webgl.$app.$gui.mainPage.addFolder({ title: '🚂 States Machines' });
	}

	let folderUid = 0;
	function addToGui(sm) {
		const gui = $gui.addFolder({
			title: sm.id,
			bg: folderUid % 2 ? '#573538' : '#101010',
		});

		const o = { name: '' };
		const sceneMonitor = gui.addBinding(o, 'name', {
			label: 'Current State',
			readonly: true,
		});

		const s = [];
		sm.states.forEach((state) => s.push({ text: state.id, value: state.id }));

		const select = gui
			.addBlade({
				view: 'list',
				label: 'States',
				options: s,
				value: sm.currentState?.id ?? null,
			})
			.on('change', ({ value }) => sm.set(value));

		gui.addButton({ title: 'Force Reset' }).on(
			'click',
			() => sm.currentState && sm.set(sm.currentState.id, true),
		);

		sm._currentState.watchImmediate((state) => {
			if (!state) return;
			o.name = state.id;
			select.value = state.id;
		});

		folderUid++;
	}
	/// #endif

	return {
		install: (webgl) => {
			webgl.$statesMachine = api;

			__DEBUG__ && devtool();

			// const sm = create('Experience', { filter: 'experience' });
			// webgl.$xpSM = sm;
			// webgl.$xpStatesMachine = sm;
			// webgl.$setState = (id) => sm.setState(id);
		},
		load: () => {
			webgl.$hooks.beforeStart.watchOnce(() =>
				webgl.$hooks.beforeUpdate.watch(update),
			);
		},
	};
}
