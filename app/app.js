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
		app.$storage = subStorage('EchoesOfMemories');
		addRouteGuard();
		document.addEventListener(
			'mousedown',
			() => (app.$store.hasInteractedOnce = true),
			{ once: true },
		);
	},
});
