import { getCurrentInstance, inject, reactive } from 'vue';

import { debounce } from '#utils/async';
import createRuller from './createRuller';


let singleton;

function viewportPlugin() {
	const debouncedUpdate = debounce(update, 500, { trail: false });

	let app;
	let ruller = null;

	const api = singleton = reactive({
		width: 10,
		height: 10,
		viewportRatio: 1,
		pixelRatio: 1,
		visible: true
	});

	function init() {
		let basicResizeUsed = false;
		let resizeTimeout = null;
		const resetResizedUsed = () => basicResizeUsed = false;

		ruller = createRuller({ root: app.$parent });
		ruller.measureScrollbarWidth();

		document.addEventListener('visibilitychange', updateVisibility, false);

		window.addEventListener('resize', () => {
			basicResizeUsed = true;
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(resetResizedUsed, 100);
			onResize();
		}, false);

		// Fix resize event not triggering when zooming on iOS
		if (window.visualViewport) {
			window.visualViewport.addEventListener('resize', () => {
				if (basicResizeUsed) return;
				onResize();
			}, false);
		}

		update();
		updateVisibility();
	}

	function onResize() {
		update();
		debouncedUpdate();
	}

	function update() {
		api.width = window.innerWidth;
		api.height = ruller.measureViewportHeight();
		api.viewportRatio = api.width / api.height;
		updateDpr();
	}

	function updateDpr() {
		const newDpr = window.devicePixelRatio || 1;
		if (newDpr === api.pixelRatio) return;
		api.pixelRatio = newDpr;
		update();
		debouncedUpdate();
	}

	function updateVisibility() {
		api.visible = !document.hidden;
		update();
	}

	return function install(_app) {
		app = _app.config.globalProperties;
		app.$viewport = api;
		_app.provide('viewport', api);
		init();
	};
}

function useViewport() {
	return getCurrentInstance() ? inject('viewport') : singleton;
}

export { useViewport, viewportPlugin };

