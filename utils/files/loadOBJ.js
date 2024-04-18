import { cache } from './cache';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

const loader = new OBJLoader();

export default async function loadOBJ(url, opts = {}) {
	return new Promise((resolve, reject) => {
		loader.load(
			url,
			data => {
				const res = data;
				cache.add(url, res);
				if (opts.onLoad) opts.onLoad(res);
				resolve(res);
			},
			() => {},
			reject
		);
	});
}

loadOBJ.loader = {
	name: 'obj',
	extensions: [ '.obj' ],
	function: loadOBJ
};
