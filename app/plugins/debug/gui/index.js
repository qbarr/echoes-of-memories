import { getCurrentInstance, inject } from 'vue';
import { createPane, setStorage } from './createPane';
import GUI from './GUI.vue';

let singleton;

const methodList = [
	'addFolder',
	'addBinding',
	'addMonitor',
	'addButton',
	'addTab',
	'addBlade'
];

function createGUI() {
	let container;
	let pane;

	const api = singleton = {
		install,
		methods: methodList,
		get pane() { return pane },
		get container() { return container }
	};

	return api;

	function install(app, opts = {}) {
		app.config.globalProperties.$gui = api;
		app.provide('gui', api);
		app.component('GUI', GUI);

		container = document.createElement('div');

		setStorage(app.config.globalProperties.$debug.storage);

		pane = createPane({
			container,
			coloredFolder: opts.coloredFolder ?? true
		});

		const tab = pane.addTab({
			pages: [
				{ title: 'MAIN' },
				{ title: 'APP' },
				{ title: 'WEBGL' },
			],
		});

		const pages = tab.pages;

		api.tab = tab;
		api.mainPage = api.main = pages[ 0 ];
		api.appPage = api.app = pages[ 1 ];
		api.webglPage = api.webgl = pages[ 2 ];

		methodList.forEach(k => {
			if (pages[ 0 ][ k ]) api[ k ] = pages[ 0 ][ k ].bind(pages[ 0 ]);
		});

		app.$onBeforeMount(v => {
			if (!app.config.globalProperties.$webgl) {
				api.tab.removePage(2);
			}
		});

		delete api.install;
	}
}

function useGUI() {
	return getCurrentInstance() ? inject('gui') : singleton;
}

export default createGUI;
export { createGUI, useGUI };
