const raw = (path, arg = {}, type = null) => ({ url: path, opts: arg, type });

const img = (path, arg = {}) => ({
	url: path,
	opts: arg,
	type: 'img',
});
const lut = (path, arg = {}) => ({
	url: path,
	opts: {
		repeat: false,
		flipY: false,
		wrapS: 1001,
		wrapT: 1001,
		nearest: true,
		...arg,
	},
	type: 'lut',
});
const msdf = (path, args = {}) => ({
	url: `${path}/*.[ktx2|png|json]`,
	type: 'msdf',
	opts: args,
});
const glb = (path) => ({ url: `${path}.glb`, type: 'glb' });
const ktx2 = (path, arg = {}) => ({
	url: `${path}.ktx2`,
	opts: arg,
	type: 'ktx2',
});

const audio = (path, args = {}) => ({
	url: `${path}/*.[mp3|wav|ogg]`,
	opts: args,
	type: 'audio',
});

const json = (path, args = {}) => ({
	url: `${path}/*.json`,
	opts: args,
	type: 'json',
});

export default {
	'msdf-font/VCR_OSD_MONO': msdf('msdf/VCR_OSD_MONO'),

	// scene1: glb('models/scene1'),
	noises: img('data-textures/*.png', { repeat: true }),
	interface: img('interface/*.*'),
	luts: lut('luts/*.[png|jpg]'),

	// Chambre
	'chambre-model': glb('scenes/chambre/model'),
	'chambre/textures': ktx2('scenes/chambre/*', { flipY: false }),

	// Clinique
	'clinique-model': glb('scenes/clinique/model'),
	'clinique/textures': ktx2('scenes/clinique/*', { flipY: false }),

	// Audios
	'sound/positions': audio('audios/positional/*', { type: 'positional' }),
	'sound/vocals': audio('audios/vocals/*', { type: 'vocal' }),
	'sound/sfx': audio('audios/sfx/*', { type: 'sfx' }),

	// Subtitles
	subtitles: json('subtitles/export/*', { type: 'subtitles' }),
};
