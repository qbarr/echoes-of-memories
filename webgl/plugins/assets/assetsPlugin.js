import { DataTexture } from 'three';


import { files } from '#utils/files';
import createTexture from '#webgl/utils/createTexture';

import loadJSON from '#utils/files/loadJSON';
import loadOBJ from '#utils/files/loadOBJ';
import loadAtlas from './loadAtlas';
import loadGLTF from './loadGLTF';
import loadImage from './loadImage';

import manifest from '#assets/manifest';


const NOOP = v => v;

export function assetsPlugin(webgl) {
	files.registerLoader(loadImage);
	files.registerLoader(loadJSON);
	files.registerLoader(loadGLTF);
	files.registerLoader(loadOBJ);

	let pgen = null;
	const data = {};
	const textures = { black: new DataTexture(new Uint8Array([ 0, 0, 0, 255 ]), 1, 1) };
	const objects = {};
	const spritesheets = {};
	const _mats = new Map();
	const _geos = new Map();

	const materials = {
		get: id => _mats.get(id),
		register: registerMaterial,
	};
	const geometries = {
		get: id => _geos.get(id),
		register: registerGeometry,
	};

	const api = {
		spritesheets,
		data,
		textures,
		objects,
		pgen,
		materials,
		geometries,

		load,
		getFont
	};


	const tasks = {
		'tex': textureTask,
		'obj': objTask,
		'gltf': gltfTask,
		'spritesheet': spritesheetTask,
		'json': jsonTask,
		'font': msdfFontTask,
	};

	tasks.avif = tasks.webp = tasks.jpg = tasks.png = tasks.tex;
	tasks.glb = tasks.gltf;

	function getFont(id) {
		const data = api.data[ id ];
		const texture = api.textures[ id ];
		if (!data || !texture) return;
		return { data, texture };
	};

	const loadPromises = [];

	function load(fileID, opts) {
		if (loadPromises[ fileID ]) return loadPromises[ fileID ];
		return loadPromises[ fileID ] = execLoad(fileID, opts);
	}

	function execLoad(fileID, { onLoad, type, id, bypassManifest = false, ...opts } = {}) {
		const preloader = webgl.$app.$preloader;
		const task = !preloader.finished ? preloader.task : NOOP;
		let file = manifest[ fileID ];
		if (!file && !bypassManifest) return;

		let url = typeof file === 'string' ? file : file.url;

		id = id || fileID.split('/').pop();
		const subID = fileID.split('/').shift();
		if (!type && fileID.includes('sprites')) type = 'spritesheet';
		if (!type && (fileID.includes('msdf') || fileID.includes('font'))) type = 'font';
		if (type) return task(tasks[ type ]({ id, file, onLoad, opts }));

		const ext = url.split('.').pop();
		const cb = tasks[ ext ];
		if (!cb) return;

		return task(cb({ id, subID, file, url, onLoad, opts }));
	}


	async function textureTask({ subID, id, file, opts }) {
		return files.load(file.url, {
			onLoad: ({ node }) => {
				let _tex = createTexture({
					id,
					img: node,
					flipY: true,
					...opts
				});

				if (subID && subID !== id) {
					textures[ subID ] = textures[ subID ] ?? {};
					textures[ subID ][ id ] = _tex;
				} else {
					textures[ id ] = _tex;
				}
			}
		});
	}


	async function objTask({ id, url }) {
		return files.load(url, { onLoad: (obj) => {
			objects[ id ] = obj;
		} });
	}


	async function gltfTask({ id, url }) {
		return files.load(url, { onLoad: (obj) => {
			objects[ id ] = obj;
		} });
	}


	async function spritesheetTask({ id, file, ...opts }) {
		const textureID = 'spritesheet-' + id;

		const [ json ] = await Promise.all([
			files.load(file.data),
			textureTask({ id: textureID, file, flipY: false, ...opts, }),
			file.normal ? textureTask({ id: textureID + '-normal', file: file.normal, ...opts, data: true, flipY: false, linear: true }) : null,
		]);

		const atlas = api.spritesheets[ id ] = loadAtlas(json, opts.opts);
		atlas.texture = textures[ textureID ];

		if (file.normal) atlas.normal = textures[ textureID + '-normal' ];
	}


	async function jsonTask({ id, file }) {
		return files.load(file, {
			onLoad: d => data[ id ] = d
		});
	}


	async function msdfFontTask({ id, file, opts, onLoad = NOOP }) {
		const { data, url } = file

		const fontData = { file: { url: data }, id, opts };
		const imgData = { file: { url }, id, opts };

		const [ font, img ] = await Promise.all([
			jsonTask(fontData),
			textureTask(imgData)
		]);

		console.log(font, img);
	}


	/* Pools
	--------------------------------------------------------- */

	function registerMaterial(id, MaterialClass, ...args) {
		if (_mats.has(id)) return _mats.get(id);
		const mat = new MaterialClass(...args);

		_mats.set(id, mat);
		return mat;
	}

	function registerGeometry(id, GeometryClass, ...args) {
		if (_geos.has(id)) return _geos.get(id);
		const geo = new GeometryClass(...args);

		_geos.set(id, geo);
		return geo;
	}

	return {
		install: () => {
			webgl.$assets = api;
		},
		load: () => {
			webgl.$hooks.afterSetup.watchOnce(() => {
				loadGLTF.initDRACOLoader();
			});
		}
	}
}
