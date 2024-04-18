import './style/main.scss';

import { createApp } from './core/createApp';

import App from './App.vue';
import { addRouteGuard } from './plugins/router/guard';

createApp({
	component: App,
	preload: async () => {},
	init: async () => {
		console.log(__DEBUG__);
		addRouteGuard()
	}
});
