import './style/main.scss';

import { createApp } from './core/createApp';
import { addRouteGuard } from './plugins/router/guard';

import App from './App.vue';

createApp({
	component: App,
	preload: async () => {},
	init: async () => {
		addRouteGuard()
	}
});