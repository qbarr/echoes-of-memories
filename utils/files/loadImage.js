import { cache } from './cache.js';

// let i = 0;

export default function loadImage(url, opts) {
	return new Promise((resolve) => {
		const node = new Image();
		node.loading = 'eager';

		// let j = i++;
		// if (__DEBUG__) console.log(j, 'LOAD', url);

		// WTF Brave
		const t = setTimeout(() => {}, 1);

		const onLoad = () => {
			// if (__DEBUG__) console.log(j, 'DONE', url);
			clearTimeout(t);
			const obj = { node, url };
			if (opts.onLoad) opts.onLoad(obj);
			cache.add(url, obj);
			resolve(obj);
		};

		const onError = err => {
			if (__DEBUG__) console.error(err);
		};

		// If not the same host, add crossorigin attr
		if (url.indexOf(location.host) === -1) {
			node.crossOrigin = 'anonymous';
		}

		if (!node.decode) {
			node.onload = onLoad;
			node.onerror = onError;
			node.decoding = 'async';
			node.src = url;
		} else {
			node.src = url;
			node.decode().then(onLoad).catch(onError);
		}
	});
}

loadImage.loader = {
	name: 'image',
	extensions: [ '.jpg', '.png', '.webp', '.avif', '.gif', '.jpeg' ],
	function: loadImage
};
