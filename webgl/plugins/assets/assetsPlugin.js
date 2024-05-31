import { DataTexture } from 'three';

import { files } from '#utils/files';
import createTexture from '#webgl/utils/createTexture';

import loadJSON from '#utils/files/loadJSON';
import loadOBJ from '#utils/files/loadOBJ';
import loadAtlas from './loadAtlas';
import loadGLTF from './loadGLTF';
import loadImage from './loadImage';

// import manifest from '#assets/manifest';

const NOOP = (v) => v;

export function assetsPlugin(webgl) {
	files.registerLoader(loadImage);
	files.registerLoader(loadJSON);
	files.registerLoader(loadGLTF);
	files.registerLoader(loadOBJ);

	let pgen = null;
	const data = {};
	const fonts = {};
	const textures = {
		black: new DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1),
	};
	const objects = {};
	const spritesheets = {};
	const _mats = new Map();
	const _geos = new Map();

	const materials = {
		get: (id) => _mats.get(id),
		register: registerMaterial,
	};
	const geometries = {
		get: (id) => _geos.get(id),
		register: registerGeometry,
	};

	const api = {
		spritesheets,
		data,
		fonts,
		textures,
		objects,
		pgen,
		materials,
		geometries,

		load,
		getFont,
	};

	const tasks = {
		tex: textureTask,
		obj: objTask,
		gltf: gltfTask,
		spritesheet: spritesheetTask,
		json: jsonTask,
		font: msdfFontTask,
	};

	tasks.avif = tasks.webp = tasks.jpg = tasks.png = tasks.img = tasks.tex;
	tasks.glb = tasks.gltf;
	tasks.msdf = tasks.font;

	function getFont(id) {
		const { data, texture } = api.fonts[id];
		if (!data || !texture) return;
		return { data, texture };
	}

	async function parseMsdfFontFiles(fileID, { onLoad, opts = {} }) {
		const { $preloader, $manifest } = webgl.$app;
		const file = $manifest.get(fileID);
		const p = [];

		// find corresponding files by original fileID
		const msdfFiles = {};
		Object.values(file.files).map((f) => {
			const id = f.origin.id;
			if (!msdfFiles[id]) msdfFiles[id] = [];
			msdfFiles[id].push(f);
		});

		const v = Object.values(msdfFiles);
		for (let i = 0; i < v.length; i++) {
			const [font, img] = v[i];

			const subID = fileID.split('/')[0];
			const id = font.origin.id;

			p.push(
				$preloader.task(
					tasks.font({
						id,
						subID,
						file: { data: font.url, url: img.url },
						opts,
						onLoad,
					}),
				),
			);
		}

		return Promise.all(p);
	}

	const loadPromises = [];

	function load(fileID, opts) {
		if (loadPromises[fileID]) return loadPromises[fileID];
		return (loadPromises[fileID] = execLoad(fileID, opts));
	}

	function execLoad(
		fileID,
		{ onLoad, bypassManifest = false, ...opts } = {},
	) {
		const { $preloader, $manifest } = webgl.$app;
		const task = !$preloader.finished ? $preloader.task : NOOP;

		console.log(fileID);

		let file = $manifest.get(fileID);
		if (!file && !bypassManifest) return;
		if (!file.files) return;

		const fileType = file.type ?? null;
		if (fileType === 'msdf')
			return parseMsdfFontFiles(fileID, { onLoad, opts });

		const p = [];
		for (const f of Object.values(file.files)) {
			const subID = fileID.split('/').shift();
			const id = f.origin.id;
			const options = { ...opts, ...file.opts };
			const url = f.url;

			p.push(
				task(
					tasks[fileType]({ url, id, subID, file: f, opts: options }),
				),
			);
		}

		return Promise.all(p);
	}

	async function textureTask({ subID, id, file, opts }) {
		let _tex = null;
		await files.load(file.url, {
			onLoad: ({ node }) => {
				_tex = createTexture({
					id,
					img: node,
					flipY: true,
					...opts,
				});

				if (subID && subID !== id) {
					textures[subID] = textures[subID] ?? {};
					textures[subID][id] = _tex;
				} else {
					textures[id] = _tex;
				}
			},
		});

		return _tex;
	}

	async function objTask({ id, url }) {
		return files.load(url, {
			onLoad: (obj) => {
				objects[id] = obj;
			},
		});
	}

	async function gltfTask({ id, url }) {
		console.log('gltfTask', id, url);
		return files.load(url, {
			onLoad: (obj) => {
				objects[id] = obj;
			},
		});
	}

	async function spritesheetTask({ id, file, ...opts }) {
		const textureID = 'spritesheet-' + id;

		const [json] = await Promise.all([
			files.load(file.data),
			textureTask({ id: textureID, file, flipY: false, ...opts }),
			file.normal
				? textureTask({
						id: textureID + '-normal',
						file: file.normal,
						...opts,
						data: true,
						flipY: false,
						linear: true,
				  })
				: null,
		]);

		const atlas = (api.spritesheets[id] = loadAtlas(json, opts.opts));
		atlas.texture = textures[textureID];

		if (file.normal) atlas.normal = textures[textureID + '-normal'];
	}

	async function jsonTask({ id, file, subID }) {
		return files.load(file, {
			onLoad: (d) => {
				if (subID) {
					data[subID] = data[subID] ?? {};
					data[subID][id] = d;
				} else {
					data[id] = d;
				}
			},
		});
	}

	async function msdfFontTask({ subID, id, file, opts, onLoad = NOOP }) {
		const { data, url } = file;

		const fontData = { file: { url: data }, subID, id, opts };
		const imgData = { file: { url }, subID, id, opts };

		const [font, img] = await Promise.all([
			jsonTask(fontData),
			textureTask(imgData),
		]);

		fonts[id] = { data: font, texture: img };
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
		},
	};
}
