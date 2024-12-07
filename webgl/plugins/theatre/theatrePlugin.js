import { deferredPromise } from '#utils/async/deferredPromise.js';
import { w } from '#utils/state';
import { storageSync } from '#utils/state/signalExtStorageSync.js';
import { getWebGL } from '#webgl/core';

import { TheatreProject } from './utils/TheatreProject';

if (!__DEVELOPMENT__) {
	// console.log('Clearing localStorage');
	localStorage.removeItem('EOM:theatrejs.persistent');
	localStorage.removeItem('EOM:theatrejs');
}

/// #if __DEBUG__
import studio from '@theatre/studio';

studio.initialize({ persistenceKey: 'EOM:theatrejs' });

const studioActive = storageSync('webgl:theatre:studioActive', w(false));
const keepLastSelection = storageSync('webgl:theatre:keepLastSelection', w(false));

let studioSelectedSheet = null;
let firstLoad = true;
studio.onSelectionChange(([selection]) => {
	if (firstLoad && !keepLastSelection.value) {
		firstLoad = false;
		studio.setSelection([]);
		return;
	}

	if (selection === null || selection === undefined) {
		// studioSelectedSheet?.resetValues();
		studioSelectedSheet?.setActive(false);
		studioSelectedSheet = null;
		return;
	}

	if (
		['Theatre_SheetObject_PublicAPI', 'Theatre_Sheet_PublicAPI'].includes(
			selection.type,
		)
	) {
		const { projectId, sheetId } = selection.address;
		if (studioSelectedSheet?.id === sheetId) return;
		const project = getProject(projectId);
		const sheet = project.getSheet(sheetId);
		studioSelectedSheet = sheet;
		sheet.setActive(true);
	}
});
/// #endif

const PROJECTS_LIST = [
	'Clinique',
	'Bedroom',
	'TV-Room',
	'Transition-Memories',
	'Flashback',
	'Interface',
	'Common',
];

function getProject(id) {
	const gl = getWebGL();
	let p = null;
	if (!gl.$theatre) gl.$hooks.afterPreload.watchOnce(() => (p = getProject(id)));
	else p = gl.$theatre.get(id);
	return p;
}

export function theatrePlugin(webgl) {
	const projects = new Map();
	const symbols = {};
	const states = {};
	const sheets = new Map();

	const dp = deferredPromise();

	const api = {
		projects,
		states,
		sheets,

		ready: dp.promise,

		registerProject,
		register: registerProject,
		get,
		getProject: get,
		getSheet,
		getProjectBySheet,

		/// #if __DEBUG__
		toggleStudio: (v) => studioActive.set(v),
		studioActive,
		get studio() {
			return studio;
		},
		/// #endif
	};

	async function init() {
		const datas = webgl.$assets.data.theatre;
		// Register all projects' state
		Object.assign(states, datas);

		const p = [];
		PROJECTS_LIST.forEach((id) => {
			const project = new TheatreProject(id);
			projects.set(project.symbol, project);
			p.push(project.instance.isReady);
		});

		await Promise.all(p);

		dp.resolve();
	}

	function registerProject(ClassProject) {
		const { id, symbol } = ClassProject;
		if (projects.has(id))
			return __DEBUG__ && console.warn(`Project '${id}' already registered`);

		projects.set(symbol, ClassProject);
		symbols[id] = symbol;

		__DEBUG__ && addProjectToGui(ClassProject);

		return ClassProject;
	}

	function get(id) {
		return projects.get(symbols[id]);
	}

	function getSheet(ClassProject, id) {
		if (typeof ClassProject === 'string') ClassProject = get(ClassProject);
		if (!ClassProject) return console.warn(`Project '${ClassProject}' not found`);
		return ClassProject.$sheets.get(id);
	}

	function getProjectBySheet(SheetClass) {
		if (typeof SheetClass === 'string') SheetClass = getSheet(SheetClass);
		if (!SheetClass) return console.warn(`Sheet '${SheetClass}' not found`);
		return SheetClass.$project;
	}

	/// #if __DEBUG__
	let projectsGui;
	function devtools() {
		const gui = webgl.$app.$gui.mainPage.addFolder({ title: '🎭 Theatre' });

		gui.addBinding(studioActive, 'value', { label: 'Enable Studio' });
		gui.addBinding(keepLastSelection, 'value', { label: 'Keep last selection' });

		studioActive.watchImmediate((v) => {
			const { setSelection, ui, __experimental } = studio;
			if (v) {
				ui.restore();
				__experimental.__experimental_enablePlayPauseKeyboardShortcut();
			} else {
				ui.hide();
				__experimental.__experimental_disblePlayPauseKeyboardShortcut();
				// setSelection([]);
			}
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

	let folderUid = 0;
	function addProjectToGui(ClassProject) {
		const projectGui = projectsGui.addFolder({
			title: '📽️ ' + ClassProject.id,
			bg: folderUid % 2 ? '#573538' : '#101010',
		});
		Object.assign(ClassProject, { $gui: projectGui });
		ClassProject.devtools?.();
		folderUid++;
	}

	// function useDiskStorage(projectID) {
	// 	const key = `EOM:theatrejs.persistent`;
	// 	const data = localStorage.getItem(key);
	// 	if (data) {
	// 		const lsData = JSON.parse(data);

	// 		const state = states[projectID];
	// 		const lsProject = lsData.historic.innerState.coreByProject[projectID];
	// 		const stateProject = state[projectID];

	// 		// override the project
	// 		Object.assign(stateProject, lsProject);

	// 		localStorage.setItem(key, JSON.stringify(lsData));
	// 		console.log('Project data overriden');
	// 	}
	// }
	// window.useDiskStorage = useDiskStorage;

	// function overrideSheetLocalStorage(project, sheet) {
	// 	const key = `EOM:theatrejs.persistent`;
	// 	const data = localStorage.getItem(key);
	// 	if (data) {
	// 		const lsData = JSON.parse(data);

	// 		if (typeof project === 'string') project = getProject(project);
	// 		if (typeof sheet === 'string') sheet = project.getSheet(sheet);

	// 		const state = states[project.id];
	// 		// > historic > coreByProject > [ProjectID] > sheetsById > [SheetID]
	// 		const lsSheet =
	// 			lsData.historic.innerState.coreByProject[project.id].sheetsById[sheet.id];
	// 		const stateSheet = state.sheetsById[sheet.id];

	// 		// override the sheet
	// 		Object.assign(stateSheet, lsSheet);

	// 		localStorage.setItem(key, JSON.stringify(lsData));
	// 		console.log('Sheet data overriden');
	// 	}
	// }
	// window.overrideSheetLocalStorage = overrideSheetLocalStorage;
	/// #endif

	return {
		install: () => {
			webgl.$theatre = api;

			__DEBUG__ && devtools();

			// PROJECTS_LIST.forEach((id) => {
			// 	const project = new TheatreProject(id);
			// 	projects.set(project.symbol, project);
			// 	projectsPromises.push(project.instance.isReady);
			// });

			// const { $preloader } = webgl.$app;
			// projectsPromises.forEach((promise) => $preloader.task(promise));
		},
		load: () => {
			// webgl.$hooks.beforeStart.watchOnce(createSheets);
			webgl.$hooks.afterPreload.watchOnce(init);
		},
	};
}
