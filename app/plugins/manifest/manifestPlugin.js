// import manifest from 'virtual:manifest/datas';

export function manifestPlugin() {
	let manifest = null;

	const api = {
		load,
		get datas() {
			return manifest;
		},
		get,
	};

	async function load() {
		manifest = (await import(':virtual:/manifest')).default;
		console.log('Manifest loaded', manifest);
	}

	function get(id) {
		const asset = manifest[id];
		if (!asset) throw new Error(`Asset "${id}" not found`);
		return resolveAsset(asset);
	}

	function resolvePath(path) {
		return path.startsWith('/') ? path : `/assets/${path}`;
	}

	function resolveAsset(_asset) {
		const asset = {};

		Object.assign(asset, {
			opts: _asset.opts,
			type: _asset.type,
			files: [],
		});

		const filesValues = Object.values(_asset.files);
		for (const { url, filename, origin } of filesValues) {
			asset.files.push({
				filename,
				url: resolvePath(url),
				origin,
			});
		}

		return asset;
	}

	return function install(app) {
		app.provide('manifest', api);
		app.config.globalProperties.$manifest = api;
	};
}
