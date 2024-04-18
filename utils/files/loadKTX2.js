import { LinearFilter, SRGBColorSpace } from 'three';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { cache } from './cache';
import { resolveUrl } from './loader';

let ktxl;

function getLoader() {
	if (ktxl) return ktxl;
	ktxl = new KTX2Loader();
	const dir = resolveUrl('vendors/basis/');
	ktxl.setTranscoderPath(dir);
	return ktxl;
}

export default async function loadKTX2(url, opts = {}) {
	return new Promise((resolve, reject) => {
		getLoader().load(
			url,
			texture => {
				texture.colorSpace = SRGBColorSpace;
				texture.minFilter = LinearFilter;
				texture.needsUpdate = true;
				cache.add(url, texture);
				if (opts.onLoad) opts.onLoad(texture);
				resolve(texture);
			},
			() => {},
			reject
		);
	});
}

loadKTX2.detectSupport = renderer => getLoader().detectSupport(renderer);
loadKTX2.loader = {
	name: 'ktx2',
	extensions: [ '.ktx2' ],
	function: loadKTX2
};
