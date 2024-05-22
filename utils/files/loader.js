/*

files loader
v3.0.0
––––––
Helpers for loading files and images

*/

import { cache } from './cache';
import loadFile from './loadFile';

const loaders = {};
const loadPromises = {};

let basepath = typeof VV_PROJECT_BASEPATH !== 'undefined'
	? VV_PROJECT_BASEPATH
	: '/';

function list() {
	return cache.list();
}

function get(url, search) {
	return cache.get(url, search);
}

function setBasepath(_basepath) {
	basepath = _basepath;
	if (!basepath.endsWith('/')) basepath += '/';
}

function resolveUrl(url) {
	if (!url.startsWith('http') && !url.startsWith('/')) url = basepath + url;
	return url;
}

function load(url, opts = {}) {
	// Test if file is not already cached
	if (cache.get(url)) return Promise.resolve(cache.get(url));

	// Test if a loading is already running
	if (loadPromises[ url ]) return loadPromises[ url ];

	url = url.url || url;
	url = resolveUrl(url);

	let p;
	if (opts.loader && loaders[ opts.loader ]) p = loaders[ opts.loader ].function(url, opts);
	else p = autoselectLoader(url, opts);

	if (p) {
		loadPromises[ url ] = p;
		p.then(() => { loadPromises[ url ] = null });
	}

	return p;
}

function registerLoader(opts) {
	if (opts.loader) opts = opts.loader;
	loaders[ opts.name ] = opts;
}

function autoselectLoader(url, opts) {
	for (const k in loaders) {
		const loader = loaders[ k ];
		if (loader.extensions) {
			const exts = loader.extensions;
			for (let i = 0; i < exts.length; i++) {
				const ext = exts[ i ];
				if (url.endsWith(ext)) {
					return loader.function(url, opts);
				}
			}
		} else if (loader.test && loader.test(url, opts)) {
			return loader.function(url, opts);
		}
	}

	return loadFile(url, opts);
}

export { resolveUrl };
export default {
	get,
	list,
	load,
	setBasepath,
	resolveUrl,
	registerLoader
};
