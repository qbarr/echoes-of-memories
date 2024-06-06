import { ShaderChunk } from 'three';

import { createLogger } from '#utils/debug';
import { idsFromGlob } from '#utils/misc';
import { useShaderProps } from '#webgl/shaders/props.js';
import { createHooks } from '#webgl/utils/createHooks';
import { patchThree } from '#webgl/utils/patchThree.js';

const chunks = idsFromGlob(import.meta.glob('../shaders/chunks/*.glsl', { eager: true }));

const { log } = createLogger('GL', '#000', '#7afbc3');

// Add some features to three js classes
patchThree();

const NOOP = (v) => v;
export const webgl = {};
let instancied = false;

if (__DEBUG__) window.$webgl = webgl;

export function getWebGL() {
	return webgl;
}

export function createWebgl(config) {
	return config;
}

// Create new webgl instance
export function initializeWebgl({
	canvas,
	defaultPlugins = [],
	config = {},
	app = {},
} = {}) {
	if (instancied) return webgl;
	instancied = true;

	// Whole webgl public api
	let api = {
		// Equivalent to Vue.use, not sure if we should use $ or not
		use: usePlugin,
		mixins: {},
		registerMixin: (k, v) => (api.mixins[k] = v),

		// These are not into debug plugin
		// because they can be used without it
		$log: log,
		$createLogger: createLogger,

		$canvas: canvas,
		$app: app, // Not sure if the whole proxy get mess was necessary

		// Global webgl state used internally
		$store: {},
	};

	// Add methods & data to the api
	Object.assign(api, config.methods ?? {}, config.data ?? {});

	// Add hooks support (mandatory plugin)
	createHooks(api);

	// Initialize some global things into three.js
	// Register shader chunks
	for (const k in chunks ?? {}) ShaderChunk[k] = chunks[k];

	// Create plugins list
	let plugins = defaultPlugins;

	// Global webgl instance can be imported everywhere in your webgl app
	api = Object.assign(webgl, api);

	hook('installPlugins', false, true, null, null, installPlugins);
	hook('setup', true, true, async () => {
		api.$hooks.installPlugins();

		// Separate plugins' gui
		__DEBUG__ && webgl.$gui.addBlade({ view: 'separator' });

		// Register global mixins
		if (config.mixins) {
			for (const k in config.mixins) {
				api.registerMixin(k, config.mixins[k]);
			}
		}
	});

	// Wrap functions to add hooks
	['update', 'render'].forEach((v) => hook(v, false));
	['preload', 'start'].forEach((v) => hook(v, true, true));
	['load'].forEach((v) => hook(v, true));
	hook('frame', true, false, null, null, () => {
		api.$hooks.update();
		api.$hooks.render();
	});
	hook(
		'prerender',
		true,
		false,
		() => (api.$store.prerendering = true),
		() => (api.$store.prerendering = false),
	);

	useShaderProps(api);

	return api;

	function installPlugins() {
		plugins = plugins.filter(Boolean);
		api.usePlugin = usePlugin;

		// Call each plugin + install
		for (let i = 0; i < plugins.length; i++) {
			const plugin = plugins[i];
			const isArr = Array.isArray(plugin);
			const plug = isArr ? plugin[0] : plugin;
			const opts = isArr ? plugin[1] : {};
			const p = usePlugin(plug, opts);
			plugins[i] = [p, opts];
		}

		// Call each load method
		for (let i = 0; i < plugins.length; i++) {
			const [load, opts] = plugins[i];
			load?.call(api, api, opts);
		}

		plugins = [];
	}

	// Shortcut function to createHook.
	// This is only to keep things DRY
	function hook(name, async, once, before, after, action) {
		return api.$createHook({
			name,
			async,
			once,
			action: action ?? config[name] ?? NOOP,
			beforeAction: before,
			afterAction: after,
		});
	}

	// Equivalent to Vue.use
	function usePlugin(plugin, opts = {}) {
		const helpers = { log: NOOP };
		opts = Object.assign({}, helpers, opts);
		const p = plugin.call(api, api, opts);
		const install = p?.install ?? p;
		install.call(api, api, opts);
		const load = p?.load ?? NOOP;
		return load;
	}
}
