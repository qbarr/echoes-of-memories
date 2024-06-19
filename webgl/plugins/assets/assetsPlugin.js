import { DataTexture, LinearFilter, RepeatWrapping } from 'three';

import { files } from '#utils/files';
import createTexture from '#webgl/utils/createTexture';

import loadJSON from '#utils/files/loadJSON';
import loadOBJ from '#utils/files/loadOBJ';
import loadAtlas from './loadAtlas';
import loadAudio from './loadAudio';
import loadGLTF from './loadGLTF';
import loadImage from './loadImage';
import loadKTX2 from './loadKTX2';
import loadLUTTexture from './loadLUTTexture';

const NOOP = () => {};

export function assetsPlugin(webgl) {
	files.registerLoader(loadImage);
	files.registerLoader(loadJSON);
	files.registerLoader(loadGLTF);
	files.registerLoader(loadOBJ);
	files.registerLoader(loadAudio);
	files.registerLoader(loadKTX2);
	files.registerLoader(loadLUTTexture);

	let pgen = null;
	const data = {};
	const audios = {};
	const subtitles = {};
	const fonts = {};
	const luts = {};
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
		luts,
		textures,
		objects,
		audios,
		pgen,
		materials,
		geometries,

		load,
		getFont,
	};

	const tasks = {
		lut: lutTextureTask,
		tex: textureTask,
		ktx2: ktx2Task,
		obj: objTask,
		gltf: gltfTask,
		spritesheet: spritesheetTask,
		json: jsonTask,
		font: msdfFontTask,
		audio: audioTask,
	};

	tasks.avif =
		tasks.webp =
		tasks.jpg =
		tasks.png =
		tasks.img =
		tasks.texture =
			tasks.tex;
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

		const files = Object.values(msdfFiles);
		for (let i = 0; i < files.length; i++) {
			const [font, img] = files[i];

			let [subID, id] = fileID.split('/');
			if (files.length > 1) id = font.origin.id;
			if (id === undefined) {
				id = subID;
				subID = null;
			}

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

	function execLoad(fileID, { onLoad, bypassManifest = false, ...opts } = {}) {
		const { $preloader, $manifest } = webgl.$app;
		const task = !$preloader.finished ? $preloader.task : NOOP;

		let file = $manifest.get(fileID);
		if (!file && !bypassManifest) return;
		if (!file.files) return;

		const fileType = file.type ?? null;
		if (fileType === 'msdf') return parseMsdfFontFiles(fileID, { onLoad, opts });

		const p = [];
		const files = Object.values(file.files);
		for (const f of files) {
			// let [subID, id] = fileID.split('/');
			let id = fileID.split('/').pop();
			let subID = fileID.split('/').shift();
			// if (files.length > 1)
			id = f.origin.id ?? id;
			if (subID === id) subID = null;

			const options = { ...opts, ...file.opts };
			const url = f.url;

			p.push(task(tasks[fileType]({ url, id, subID, file: f, opts: options })));
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

	// async function lutCubeTask({ subID, id, file, opts }) {
	// 	let _tex = null;

	// 	await files.load(file.url, {
	// 		onLoad: (tex) => {
	// 			_tex = tex;
	// 			if (subID && subID !== id) {
	// 				luts[subID] = luts[subID] ?? {};
	// 				luts[subID][id] = _tex;
	// 			} else {
	// 				luts[id] = _tex;
	// 			}
	// 		},
	// 	});

	// 	return _tex;
	// }

	async function lutTextureTask({ subID, id, file, opts }) {
		let _tex = null;

		await loadLUTTexture(file.url, {
			onLoad: (tex) => {
				_tex = tex;
				tex.texture3D.userData.id = id;

				if (subID && subID !== id) {
					textures[subID] = textures[subID] ?? {};
					textures[subID][id] = _tex;
				} else {
					textures[id] = _tex;
				}

				luts[id] = _tex;
			},
		});

		return _tex;
	}

	async function ktx2Task({ id, subID, file, opts }) {
		if (!file.url.endsWith('.ktx2')) return textureTask({ id, file, opts });

		return files.load(file.url, {
			onLoad: (texture) => {
				let _tex = texture;

				_tex.userData.id = id;

				if (opts.repeat) _tex.wrapS = _tex.wrapT = RepeatWrapping;
				if (opts.flipY !== undefined) _tex.flipY = opts.flipY;
				if (opts.linear !== undefined)
					_tex.minFilter = _tex.magFilter = LinearFilter;
				if (opts.srgb !== undefined) {
					_tex.colorSpace = opts.srgb ? 'srgb' : 'srgb-linear';
				} else {
					_tex.colorSpace = '';
				}

				_tex.needsUpdate = true;

				if (subID) {
					textures[subID] = textures[subID] ?? {};
					textures[subID][id] = _tex;
				} else {
					textures[id] = _tex;
				}

				texture.userData.file = file;
			},
		});
	}

	async function objTask({ id, subID, url }) {
		return files.load(url, {
			onLoad: (obj) => {
				if (subID) {
					objects[subID] = objects[subID] ?? {};
					objects[subID][id] = obj;
				} else {
					objects[id] = obj;
				}
			},
		});
	}

	async function gltfTask({ id, subID, url }) {
		return files.load(url, {
			onLoad: (obj) => {
				if (subID) {
					objects[subID] = objects[subID] ?? {};
					objects[subID][id] = obj;
				} else {
					objects[id] = obj;
				}
			},
		});
	}

	async function audioTask({ subID, id, url, opts }) {
		return files.load(url, {
			type: opts.type,
			onLoad: (audio) => {
				const type = opts.type ?? (id.includes('bgm') ? 'bgm' : 'audio');
				const _audio = { audio, type };
				if (subID) {
					audios[subID] = audios[subID] ?? {};
					audios[subID][id] = _audio;
				} else {
					audios[id] = _audio;
				}
			},
		});
	}

	async function spritesheetTask({ subID, id, file, ...opts }) {
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

		const [font, img] = await Promise.all([jsonTask(fontData), textureTask(imgData)]);

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
				loadKTX2.detectSupport(webgl.$threeRenderer);
			});
		},
	};
}
