import { cache } from '#utils/files/cache';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

const loader = new FontLoader();

export default function loadFont(url, opts) {
	console.log(url, opts);
	return new Promise((resolve) => {
		const onLoad = data => {
			console.log(data);
			const obj = { data, url };
			if (opts.onLoad) opts.onLoad(obj);
			cache.add(url, obj);
			console.log(obj);
			resolve(obj);
		};

		const onError = err => {
			if (DEBUG) console.error(err);
		};

		loader.load(url, onLoad, null, onError);
	});
}

loadFont.loader = {
	name: 'font',
	extensions: [ '.json' ],
	function: loadFont
};
