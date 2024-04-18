// Bridge file to import to load the webgl from another chunk
// The file is specifically name webgl to have a `webgl` chunk automatically named

import { initializeWebgl } from './index.js';
import { plugins as defaultPlugins } from '#webgl/plugins';
import config from '#webgl/webgl.js';

export function loadWebgl(opts = {}) {
	return initializeWebgl({
		config,
		defaultPlugins,
		...opts
	});
}
