import { cache } from '#utils/files/cache';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const gltfLoader = new GLTFLoader();

export default async function loadGLTF(url, opts = {}) {
	return new Promise((resolve, reject) => {
		gltfLoader.load(
			url,
			(data) => {
				cache.add(url, data);
				if (opts.onLoad) opts.onLoad(data);
				resolve(data);
			},
			() => {},
			reject,
		);
	});
}

loadGLTF.initDRACOLoader = () => {
	const draco = new DRACOLoader();
	draco.setDecoderPath(`vendors/draco/`);
	draco.preload();

	gltfLoader.setDRACOLoader(draco);
};

loadGLTF.loader = {
	name: 'gltf',
	extensions: ['.gltf', '.glb'],
	function: loadGLTF,
};
