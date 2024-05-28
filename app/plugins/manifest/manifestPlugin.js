// import manifestUrl from 'virtual:manifest/manifest.json';
export function manifestPlugin() {
	let manifest = null;
	const api = {
		init,
		list: () => manifest,
		get,
	};

	async function init() {
		// console.log(manifestUrl);
		manifest = await (await fetch('/assets/.gen/manifest.json')).json();
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
		const asset = Object.assign({}, { ..._asset });

		if (asset.url) asset.url = resolvePath(asset.url);
		if (asset.data) asset.data = asset.data;

		return asset;
	}

	return function install(app) {
		app.provide('manifest', api);
		app.config.globalProperties.$manifest = api;
	};
}
