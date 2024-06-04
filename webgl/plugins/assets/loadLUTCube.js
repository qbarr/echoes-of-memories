import { LUTCubeLoader } from 'three/addons/loaders/LUTCubeLoader.js';
import { cache } from '#utils/files/cache.js';
import { CubeTexture } from 'three';

const loader = new LUTCubeLoader();

export default async function loadLUTCube(url, opts = {}) {
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

loadLUTCube.loader = {
	name: 'cube',
	extensions: ['.cube'],
	function: loadLUTCube,
};
