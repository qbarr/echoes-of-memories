// import './style/main.scss'

// import AppComponent from './App.vue'
// import { createApp, onDOMReady } from './core/createApp'
// import { plugins } from './plugins'
// import { addRouteGuard } from './plugins/router/guard'

// onDOMReady(async () => {
//   const app = createApp(AppComponent)

//   const { $audio, $preloader } = await app.installPlugins(plugins)

// 	addRouteGuard()

// 	const s = Object.entries($audio.raw_sounds)
// 	s.forEach(([name, url]) => $preloader.task($audio.load(name, url)))

//   const appNode = document.getElementById('app')
//   if (!appNode) throw new Error('Missing #app')

//   app.mount(appNode)
// })

import './style/main.scss';

import { createApp } from './core/createApp';
import { createWebHistory as historyMode } from 'vue-router';

import App from './App.vue';
import { addRouteGuard } from './plugins/router/guard';

createApp({
	component: App,
	router: { historyMode },
	plugins: [],
	preload: async () => {},
	init: async () => {
		addRouteGuard()
	}
});
