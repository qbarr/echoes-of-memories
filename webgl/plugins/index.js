import { fboPlugin } from './fbo/fboPlugin.js';
import { qualityPlugin } from './quality/qualityPlugin.js';
import { rendererPlugin } from './renderer/rendererPlugin.js';
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
	rendererPlugin,
	timePlugin,
	viewportPlugin,
	__DEBUG__ && debugCameraPlugin,

	/* PROJECT PLUGINS */
	// ...
]
