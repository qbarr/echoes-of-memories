import { w } from '#utils/state/index.js';
import { storageSync } from '#utils/state/signalExtStorageSync.js';
import { getWebGL } from '#webgl/core/index.js';

import { TheatreProject } from './utils/TheatreProject';

/// #if __DEBUG__
/// #code import studio from '@theatre/studio';
studio.initialize({
	persistenceKey: 'EOM:theatrejs',
	usePersistentStorage: true,
});
const studioActive = storageSync('webgl:theatre:studioActive', w(false));

let studioSelectedSheet = null;
studio.onSelectionChange(([selection]) => {
	if (selection === null || selection === undefined) {
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
		sheet.setActive(true);
	}
});
/// #endif

const PROJECTS_LIST = [
	'Clinique-Scene',
	'Clinique-Camera',
	'Bedroom-Scene',
	'Bedroom-Camera',
	'Transition-Memories',
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

	const projectsPromises = [];

	const api = {
		projects,
		states,
		sheets,

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

	function init() {
		const datas = webgl.$assets.data.theatre;
		// Register all projects' state
		Object.assign(states, datas);
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

	let folderUid = 0;
	function addProjectToGui(ClassProject) {
		const projectGui = projectsGui.addFolder({
			title: '📽️ ' + ClassProject.id,
			bg: folderUid % 2 ? '#202020' : '#101010',
		});
		Object.assign(ClassProject, { $gui: projectGui });
		ClassProject.devtools?.();
		folderUid++;
	}
	/// #endif

	return {
		install: () => {
			webgl.$theatre = api;

			__DEBUG__ && devtools();

			PROJECTS_LIST.forEach((id) => {
				const project = new TheatreProject(id);
				projects.set(project.symbol, project);
				projectsPromises.push(project.instance.isReady);
			});

			const { $preloader } = webgl.$app;
			projectsPromises.forEach((promise) => $preloader.task(promise));
		},
		load: () => {
			webgl.$hooks.afterPreload.watchOnce(init);
			// webgl.$hooks.beforeStart.watchOnce(createSheets);
			// webgl.$hooks.afterPreload.watchOnce(init);
		},
	};
}
