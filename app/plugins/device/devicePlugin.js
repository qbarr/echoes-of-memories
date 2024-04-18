import { getCurrentInstance, inject } from 'vue';
import getDeviceInfos from './getDeviceInfos';

let singleton;

function devicePlugin(opts = {}) {
	let app;

	const api = singleton = {
		updateQuality
	};

	return { install };

	function init() {
		const infos = getDeviceInfos(opts.userAgent);
		Object.assign(api, infos);
		addClasses(api);
	}

	function updateQuality(quality) {
		const html = app.$parent ?? document.documentElement;
		if (!api.gpu) return;
		api.gpu.qualityIndex = quality;
		const qualities = api.gpu.qualities;
		for (const k in qualities) {
			if (api.gpu && api.gpu.quality) {
				api.gpu.quality[ qualities[ k ] ] = k <= quality;
			}
			html.classList.toggle(qualities[ k ], (quality == k));
		}
	}

	function addClasses(stats) {
		const html = app.$parent ?? document.documentElement;
		stats.hasTouch && html.classList.add('touch');
		for (const type in stats.type) stats.type[ type ] && html.classList.add(type.toLowerCase());
		if (stats.browser && stats.browser.length > 0) html.classList.add(stats.browser.toLowerCase());
		if (stats.os && stats.os.length > 0 && stats.os !== 'Unknown') html.classList.add(stats.os.toLowerCase());
	}

	function install(_app) {
		app = _app.config.globalProperties;
		app.$device = api;
		_app.provide('device', api);
		_app.$onBeforeMount(async () => {
			await api.gpuDetectionFinished;
			updateQuality(api.gpu.qualityIndex);
		});

		init();
	}
}

function useDevice() {
	return getCurrentInstance() ? inject('device') : singleton;
}

export { devicePlugin, useDevice };
