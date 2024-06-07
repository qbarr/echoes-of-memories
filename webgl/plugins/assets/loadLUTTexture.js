import { cache } from '#utils/files/cache.js';
import { LUTImageLoader } from 'three/examples/jsm/loaders/LUTImageLoader.js';

const loader = new LUTImageLoader();

export default async function loadLUTTexture(url, opts = {}) {
	return new Promise((resolve, reject) => {
		loader.load(
			url,
			(texture) => {
				cache.add(url, texture);
				if (opts.onLoad) opts.onLoad(texture);
				resolve(texture);
			},
			() => {},
			reject,
		);
	});
}

loadLUTTexture.loader = {
	name: 'cube',
	extensions: ['.png', '.jpg', '.jpeg'],
	function: loadLUTTexture,
};
