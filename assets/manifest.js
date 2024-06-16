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
	'msdf/VCR_OSD_MONO': msdf('msdf/VCR_OSD_MONO'),

	// scene1: glb('models/scene1'),
	noises: img('data-textures/*.png', { repeat: true }),
	interface: img('interface/*.*'),
	luts: lut('luts/*.[png|jpg]'),

	boat: glb('scenes/boat'),

	// Clinique
	'clinique/model': glb('scenes/clinique/model'),
	'clinique/textures': ktx2('scenes/clinique/*', { flipY: false }),
	'clinique/audios': audio('audios/clinique/*'),
	'clinique/subtitles': json('subtitles/clinique/*', { type: 'subtitles' }),

	// TV Room
	'tv-room/model': glb('scenes/tv-room/model'),
	'tv-room/textures': ktx2('scenes/tv-room/*', { flipY: false }),
	'tv-room/audios': audio('audios/tv-room/*'),
	'tv-room/subtitles': json('subtitles/tv-room/*', { type: 'subtitles' }),

	// Bedroom
	'bedroom/model': glb('scenes/bedroom/model'),
	'bedroom/textures': ktx2('scenes/bedroom/*', { flipY: false }),
	'bedroom/audios': audio('audios/bedroom/*'),
	'bedroom/subtitles': json('subtitles/bedroom/*', { type: 'subtitles' }),

	// Flashback
	'flashback/audios': audio('audios/flashback/*'),
	'flashbacks/meal/model': glb('scenes/flashbacks/meal'),
	// 'flashback/subtitles': json('subtitles/flashback/*', { type: 'subtitles' }),

	// Audios
	positions: audio('audios/positional/*', { type: 'positional' }),
	vocals: audio('audios/vocals/*', { type: 'vocal' }),
	sfx: audio('audios/sfx/*', { type: 'sfx' }),

	// Subtitles
	subtitles: json('subtitles/export/*', { type: 'subtitles' }),

	// Theatre projects' state
	theatre: json('theatre/*'),
};
