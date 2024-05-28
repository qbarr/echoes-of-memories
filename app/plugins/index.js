/// #if __DEBUG__
/// #code import { debugPlugin } from './debug/debugPlugin.js'
/// #endif

import { devicePlugin } from './device/devicePlugin.js';
import { manifestPlugin } from './manifest/manifestPlugin.js';
import { preloaderPlugin } from './preloader/preloaderPlugin.js';
import { routerPlugin } from './router/routerPlugin.js';
import { storePlugin } from './store/storePlugin.js';
import { viewportPlugin } from './viewport/viewportPlugin.js';
import { webglPlugin } from './webgl/webglPlugin.js';

export const plugins = [
	/* CORE PLUGINS */
	storePlugin,
	viewportPlugin,
	devicePlugin,
	__DEBUG__ && debugPlugin,
	routerPlugin,
	preloaderPlugin,
	webglPlugin,

	/* PROJECT PLUGINS */
	// manifestPlugin,
];
