import { cache } from '#utils/files/cache';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

const loader = new FontLoader();

export default function loadFont(url, opts) {
	return new Promise((resolve) => {
		const onLoad = (data) => {
			const obj = { data, url };
			if (opts.onLoad) opts.onLoad(obj);
			cache.add(url, obj);
			resolve(obj);
		};

		const onError = (err) => {
			if (__DEBUG__) console.error(err);
		};

		loader.load(url, onLoad, null, onError);
	});
}

loadFont.loader = {
	name: 'font',
	extensions: ['.json'],
	function: loadFont,
};
