// Create function cannot be inside app/index.js
// Because it seems to break HMR (circular dependency?)

import { onDOMReady } from '#utils/dom';
import { createApp as createVueApp } from 'vue';

import subStorage from '#utils/state/subStorage.js';
import { addAppHooks } from '#app/utils/addAppHooks.js';
import { getApp } from './index.js';

import { plugins as rawPlugins } from '#app/plugins';


const NOOP = v => v;

export function createApp(options = {}) {
	const appInstance = createVueApp(options.component);
	const plugins = appInstance.config.globalProperties = getApp();
	appInstance.isVitevueApp = true;

	if (__DEBUG__) window.$app = plugins;
	appInstance.provide('app', plugins);
	appInstance.provide('plugins', plugins);

	// Add scoped storages for app
	if (typeof __PROJECT_NAME__ !== 'undefined') {
		plugins.$localStorage = subStorage(__PROJECT_NAME__);
		plugins.$sessionStorage = subStorage(__PROJECT_NAME__, { storage: sessionStorage });
	}

	// Add usefull app hooks (beforeMount / afterMount)
	addAppHooks(appInstance);

	// Add performance profiling in chrome in __DEBUG__ mode
	if (__DEBUG__) appInstance.config.performance = true;

	// Start app lifecycle once DOM is ready
	onDOMReady(async () => {
		// Before plugin load
		if (options.beforePluginsInstall) await options.beforePluginsInstall();

		const pluginBeforeLoads = [];
		const pluginLoads = [];
		const pluginInits = [];
		const pluginArray = [];

		// Install default plugins & plugins from vitevue config
		const plugins = rawPlugins.filter(Boolean);
		for (let i = 0; i < plugins.length; i++) {
			const _plugin = plugins[ i ];
			const pluginFn = typeof _plugin === 'function' ? _plugin : _plugin[ 0 ];
			const options = typeof _plugin === 'function' ? {} : _plugin[ 1 ];
			const plugin = pluginFn(options)
			appInstance.use(plugin, options)
			pluginArray.push([ plugin, options ]);
		}

		// Gather plugins hooks
		for (let i = 0; i < pluginArray?.length; i++) {
			const [ plugin ] = pluginArray[ i ];
			if (plugin.beforeLoad) pluginBeforeLoads.push(plugin.beforeLoad);
			if (plugin.load) pluginLoads.push(plugin.load);
			if (plugin.init) pluginInits.push(plugin.init);
		}

		// Get preload task method so we can wrap loading methods in it
		const t = plugins?.$preloader?.task ?? NOOP

		// Plugin's beforeLoad
		for (const beforeLoad of pluginBeforeLoads) await t(beforeLoad(appInstance));

		// Before plugin load
		if (options.beforePluginsLoad) await t(options.beforePluginsLoad(appInstance));

		// Load plugins in parallel
		if (options.preload) pluginLoads.push(options.preload);
		await Promise.all(pluginLoads.map(p => t(p(appInstance))));

		// Init plugins
		if (options.beforePluginsInit) await t(options.beforePluginsInit(appInstance));
		for (let i = 0; i < pluginInits.length; i++) await t(pluginInits[ i ]());

		// Mount app
		if (options.init) await t(options.init(appInstance));

		if (plugins.$preloader && options.beforePreloaderExit)
			plugins.$preloader.beforeExit(options.beforePreloaderExit);

		appInstance.$onBeforeMount(async () => {
			if (options.beforeMount) await t(options.beforeMount(appInstance));
		});

		appInstance.$onAfterMount(async () => {
			if (options.afterMount) await t(options.afterMount(appInstance));
		});

		if (options.mountTo !== false)
			appInstance.mount(options.mountTo ?? '#app');

		// Free plugin hooks from memory
		pluginBeforeLoads.length = 0;
		pluginLoads.length = 0;
		pluginInits.length = 0;
		pluginArray.length = 0;
	});

	return appInstance;
}
