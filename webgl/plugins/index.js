/// #if __DEBUG__
/// #code import { debugPlugin } from './debug/debugPlugin.js';
/// #code import { debugCameraPlugin } from './debugCamera/debugCameraPlugin.js';
/// #endif

import { assetsPlugin } from './assets/assetsPlugin.js';
import { composerPlugin } from './composer/composerPlugin.js';
import { fboPlugin } from './fbo/fboPlugin.js';
import { gpgpuPlugin } from './gpgpu/gpgpuPlugin.js';
import { qualityPlugin } from './quality/qualityPlugin.js';
import { raycastPlugin } from './raycast/raycastPlugin.js';
import { rendererPlugin } from './renderer/rendererPlugin.js';
import { scenesPlugin } from './scenes/scenesPlugin.js';
import { timePlugin } from './time/timePlugin.js';
import { viewportPlugin } from './viewport/viewportPlugin.js';

import { audioPlugin } from './audio/audioPlugin.js';
import { statesMachinePlugin } from './states/statesMachinePlugin.js';
import { subtitlesPlugin } from './subtitles/subtitlesPlugin.js';
import { theatrePlugin } from './theatre/theatrePlugin.js';

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
	subtitlesPlugin,
	audioPlugin,
	__DEBUG__ && debugCameraPlugin,
	assetsPlugin,

	/* PROJECT PLUGINS */
	raycastPlugin,
	theatrePlugin,
	gpgpuPlugin,
	statesMachinePlugin,
];
