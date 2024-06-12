import { getCurrentInstance, inject, ref, watchEffect } from 'vue';

import subStorage from '#utils/state/subStorage.js';
import Debug from './Debug.vue';
import debugBreakpoints from './debugBreakpoints';
import { createGUI, useGUI } from './gui';

const ns = typeof __PROJECT_NAME__ != 'undefined' ? __PROJECT_NAME__ : 'project';
subStorage.debug = subStorage('__DEBUG__::' + ns);

const S_KEY = 'global-active';
let singleton;

function debugPlugin() {
	const storage = subStorage.debug;
	const gui = createGUI();
	const active = ref();

	const api = (singleton = {
		install,
		gui,
		storage,
		active,
	});

	return api;

	function onDebugKeyboard(e) {
		const tag = e.target && e.target.tagName;
		if (tag === 'INPUT' || tag === 'TEXTAREA' || e.key !== 't') return;
		active.value = !active.value;
		if (active.value) document.exitPointerLock();
	}

	function onDebugTouch(e) {
		if (!e.touches || e.touches.length < 3) return;
		active.value = !active.value;
	}

	function install(app, opts = {}) {
		app.config.globalProperties.$debug = api;
		app.provide('debug', api);
		app.component('Debug', Debug); // eslint-disable-line

		active.value = !!storage.getItem(S_KEY);
		watchEffect(() => storage.setItem(S_KEY, !!active.value));
		window.addEventListener('keydown', onDebugKeyboard);
		window.addEventListener('touchstart', onDebugTouch);

		gui.install(app, opts);
		app.$onBeforeMount(() => debugBreakpoints(app.config.globalProperties));

		delete api.install;
	}
}

function useDebug() {
	return getCurrentInstance() ? inject('gui') : singleton;
}

export { debugPlugin, useDebug, useGUI };
