import './style/main.scss';

import { createApp } from './core/createApp';
import { addRouteGuard } from './plugins/router/guard';

import App from './App.vue';
import subStorage from '#utils/state/subStorage.js';

createApp({
	component: App,
	preload: async (_, app) => {
		await app.$manifest.load();
	},
	init: async (_, app) => {
		const { $store, $preloader, $webgl, $device } = app;

		app.$storage = subStorage('EchoesOfMemories');
		addRouteGuard();
		document.addEventListener( 'mousedown', () => $store.hasInteractedOnce = true, { once: true });
		// Enable raycasting after preloader exit
		$preloader.afterExit(() => {
			if (!$device.type.mobile) $webgl.$raycast.realEnabled.set(true);

			$store.hintContent = 'Cliquer pour commencer'
			$store.showHint = true;
		})
	},
});
