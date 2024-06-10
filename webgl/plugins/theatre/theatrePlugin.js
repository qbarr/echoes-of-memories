import { w } from '#utils/state/index.js';
import { storageSync } from '#utils/state/signalExtStorageSync.js';

import core, { getProject, types } from '@theatre/core';

/// #if __DEBUG__
/// #code import studio from '@theatre/studio';
studio.initialize({
	persistenceKey: 'EOM:theatrejs',
	usePersistentStorage: true,
});
const studioActive = storageSync('webgl:theatre:studioActive', w(false));
/// #endif

export function theatrePlugin(webgl) {
	const projects = new Map();
	const symbols = {};

	const api = {
		projects,

		createProject,
		get,

		/// #if __DEBUG__
		toggleStudio: (v) => studioActive.set(v),
		studioActive,
		get studio() {
			return studio;
		},
		/// #endif
	};

	function init() {
		__DEBUG__ && devtools();
	}

	function createProject({ id, config = null } = {}) {
		if (projects.has(id))
			return __DEBUG__ && console.warn(`Project '${id}' already created`);

		const project = config ? getProject(id, config) : getProject(id);
		const symbol = Symbol(id);
		projects.set(symbol, project);
		symbols[id] = symbol;
		return project;
	}

	function get(id) {
		return projects.get(symbols[id]);
	}

	/// #if __DEBUG__
	function devtools() {
		const gui = webgl.$app.$gui.mainPage.addFolder({ title: '🎭 Theatre' });
		gui.addBinding(studioActive, 'value', { label: 'Enable Studio' });

		studioActive.watchImmediate((v) => {
			v ? studio.ui.restore() : studio.ui.hide();
		});
	}
	/// #endif

	return {
		install: () => {
			webgl.$theatre = api;
		},
		load: () => {
			webgl.$hooks.afterSetup.watchOnce(init);
		},
	};
}
