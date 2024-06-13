import { events, w } from '#utils/state/index.js';
import { storageSync } from '#utils/state/signalExtStorageSync.js';

import core, { createRafDriver, getProject, onChange, types, val } from '@theatre/core';
import { TheatreSheet } from './utils';

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
	const states = {};
	const sheets = w(null);

	const api = {
		projects,
		states,
		sheets,
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
		const datas = webgl.$assets.data.theatre;
		Object.assign(states, datas);

		__DEBUG__ && devtools();
	}

	function createProject(id) {
		if (projects.has(id))
			return __DEBUG__ && console.warn(`Project '${id}' already created`);

		// Get project state
		let state = null;
		if (states[id]) state = states[id];

		const project = state ? getProject(id, { state }) : getProject(id);
		const symbol = Symbol(id);
		projects.set(symbol, project);
		symbols[id] = symbol;

		__DEBUG__ && addProjectToGui(project);

		return project;
	}

	async function createSheets() {
		/// #if __DEBUG__
		const transitionProject = createProject('Transition-Memories')
		await Promise.all([
			transitionProject.ready,
		]);
		/// #endif

		const transitionSheet = new TheatreSheet('transition', { project: transitionProject });
		transitionSheet.$composer(['lut', 'crt']);
		transitionSheet.$bool('switchScene', { value: false }, {
			onUpdate: (bool) => {
				if (bool) webgl.$scenes.switch('particle');
				else webgl.$scenes.switch('bedroom');
 			}
		})
		transitionProject.$sheets = {
			transition : transitionSheet
		}

		const _sheets = {
			...transitionProject.$sheets
		}

		sheets.set(_sheets);

	}

	function get(id) {
		return projects.get(symbols[id]);
	}

	/// #if __DEBUG__
	let projectsGui;
	function devtools() {
		const gui = webgl.$app.$gui.mainPage.addFolder({ title: '🎭 Theatre' });
		gui.addBinding(studioActive, 'value', { label: 'Enable Studio' });

		studioActive.watchImmediate((v) => {
			v ? studio.ui.restore() : studio.ui.hide();
		});

		const warningGui = gui.addFolder({ title: '⚠️ Warning' });
		warningGui.addMonitor(
			{ value: 'Make sure to export the\nprojects before\nclearing localStorage' },
			'value',
			{
				label: '!!',
				multiline: true,
			},
		);
		warningGui.addButton({ title: 'Clear localStorage' }).on('click', () => {
			localStorage.removeItem('EOM:theatrejs.persistent');
			localStorage.removeItem('EOM:theatrejs');
			window.location.reload();
		});

		projectsGui = gui.addFolder({ title: 'Projects' });
	}

	let t = 0;
	function addProjectToGui(project) {
		const projectGui = projectsGui.addFolder({
			title: '📽️ ' + project.address.projectId,
			bg: t % 2 ? '#202020' : '#101010',
		});
		Object.assign(project, { $gui: projectGui });
		t++;
	}
	/// #endif

	return {
		install: () => {
			webgl.$theatre = api;
		},
		load: () => {
			webgl.$hooks.afterPreload.watchOnce(init);
			webgl.$hooks.beforeStart.watchOnce(createSheets);
			// webgl.$hooks.afterPreload.watchOnce(init);
		},
	};
}
