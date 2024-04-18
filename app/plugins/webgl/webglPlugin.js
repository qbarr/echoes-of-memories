// This plugin will load webgl framework and link it to the app side

import { deferredPromise } from '#utils/async/deferredPromise.js';
import { inject, getCurrentInstance } from 'vue';
import WebGL from './WebGL.vue';

/// #if typeof __WEBGL_ASYNC__ !== "undefined" && __WEBGL_ASYNC__
/// #code const getLoadWebgl = import('#webgl/core/loader.js');
/// #else
import { loadWebgl } from '#webgl/core/loader.js';
/// #code import * as THREE from 'three';
/// #endif

let singleton = null;

/// #if __DEBUG__
/// #code import { createLogger } from '#utils/debug';
/// #code const { log } = createLogger('GL', '#000', '#7afbc3');
/// #else
const log = () => {};
/// #endif

function webglPlugin(opts = {}) {
	let canvas;
	let webgl;

	let webglLoaded = deferredPromise();
	let isReady = false;
	let readyListeners = [];

	const internalApi = {
		onReady,
		get isReady() { return isReady },
		get canvas() { return canvas }
	};

	function ready() {
		isReady = true;
		for (let i = 0; i < readyListeners.length; i++) readyListeners[ i ](api);
		readyListeners.length = 0;
	}

	function onReady(cb) {
		if (isReady) cb(webgl);
		else readyListeners.push(cb);
	}

	return {
		install(_app) {
			const app = _app.config.globalProperties;

			_app.component('WebGL', WebGL);
			app.$webgl = {};
			app.$webglInternals = internalApi;

			canvas = document.createElement('canvas');

			const { $preloader } = app
			if (!$preloader) return;

			$preloader.task(async () => {
				await webglLoaded;
				ready();
				await webgl.$hooks.setup();
				await webgl.$hooks.preload();
			}, { weight: 3 });

			// Start webgl before exiting preloader
			$preloader.beforeExit(async () => {
				await webgl.$hooks.start();
				await webgl.$hooks.prerender();
			});
		},

		async load(_app) {
			/// #if typeof __WEBGL_ASYNC__ !== 'undefined' && __WEBGL_ASYNC__
			/// #code const { loadWebgl } = await getLoadWebgl;
			/// #endif

			const app = _app.config.globalProperties;
			webgl = loadWebgl({ app, canvas });
			app.$webgl = webgl;
			webglLoaded.resolve();
		}
	};
}

function useWebGL() {
	return getCurrentInstance() ? inject('webGL') : singleton;
}

export { webglPlugin, useWebGL };
