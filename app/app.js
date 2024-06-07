import './style/main.scss';

import { createApp } from './core/createApp';
import { addRouteGuard } from './plugins/router/guard';

import App from './App.vue';

createApp({
	component: App,
	preload: async (_, app) => {
		await app.$manifest.load();

		// fetch to test
		// console.log(app.$manifest.datas);
		// const response = await fetch(
		// 	app.$manifest.datas.scene1.files['scene1.glb'].url,
		// );
		// console.log(response);
	},
	init: async () => {
		addRouteGuard();
	},
});
