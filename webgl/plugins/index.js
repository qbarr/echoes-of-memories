import { assetsPlugin } from './assets/assetsPlugin.js';
import { fboPlugin } from './fbo/fboPlugin.js';
import { qualityPlugin } from './quality/qualityPlugin.js';
import { rendererPlugin } from './renderer/rendererPlugin.js';
import { composerPlugin } from './composer/composerPlugin.js';
import { scenesPlugin } from './scenes/scenesPlugin.js';
import { timePlugin } from './time/timePlugin.js';
import { viewportPlugin } from './viewport/viewportPlugin.js';

/// #if __DEBUG__
import { debugPlugin } from './debug/debugPlugin.js';
import { debugCameraPlugin } from './debugCamera/debugCameraPlugin.js';
/// #endif

export const plugins = [
	/* CORE PLUGINS */
	__DEBUG__ && debugPlugin,
	fboPlugin,
	qualityPlugin,
	viewportPlugin,
	rendererPlugin,
	composerPlugin,
	timePlugin,
	scenesPlugin,
	__DEBUG__ && debugCameraPlugin,
	assetsPlugin,

	/* PROJECT PLUGINS */
	// ...
]
