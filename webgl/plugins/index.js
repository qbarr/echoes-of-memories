import { fboPlugin } from "./fbo/fboPlugin.js";
import { qualityPlugin } from "./quality/qualityPlugin.js";
import { rendererPlugin } from "./renderer/rendererPlugin.js";
import { timePlugin } from "./time/timePlugin.js";
import { viewportPlugin } from "./viewport/viewportPlugin.js";
import { scenesPlugin } from "./scenes/scenesPlugin.js";

/// #if __DEBUG__
import { debugPlugin } from "./debug/debugPlugin.js";
import { debugCameraPlugin } from "./debugCamera/debugCameraPlugin.js";
/// #endif

import { subtitlesPlugin } from "./subtitles/subtitlesPlugin.js";
import { audioPlugin } from "./audio/audioPlugin.js";
import { composerPlugin } from "./composer/composerPlugin.js";
import { assetsPlugin } from "./assets/assetsPlugin.js";

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
	// ...
];
