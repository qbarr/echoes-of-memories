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

	// Clinique
	'clinique/model': glb('scenes/clinique/model'),
	'clinique/textures': ktx2('scenes/clinique/*', { flipY: false }),
	'clinique/audios': audio('audios/clinique/*'),
	// 'clinique/bgm': audio('audios/bgm/clinique/*', { type: 'bgm' }),
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
	// 'bedroom/bgm': audio('audios/bgm/bedroom/*', { type: 'bgm' }),
	'bedroom/subtitles': json('subtitles/bedroom/*', { type: 'subtitles' }),

	// É
	'flashbacks/audios': audio('audios/flashbacks/*'),
	'flashbacks/meal/model': glb('scenes/flashbacks/meal'),
	'flashbacks/truck/model': glb('scenes/flashbacks/truck'),
	'flashbacks/war/model': glb('scenes/flashbacks/war'),
	'flashbacks/subtitles': json('subtitles/flashbacks/*', { type: 'subtitles' }),

	// Audios
	// positions: audio('audios/positional/*', { type: 'positional' }),
	// vocals: audio('audios/vocals/*', { type: 'vocal' }),
	'common/sfx': audio('audios/sfx/common/*', { type: 'sfx' }),
	'adam/sfx': audio('audios/sfx/adam/*', { type: 'sfx' }),
	'ben/sfx': audio('audios/sfx/ben/*', { type: 'sfx' }),

	intro: audio('audios/intro'),
	// outro: audio('audios/outro'),

	// Subtitles
	subtitles: json('subtitles/export/*', { type: 'subtitles' }),

	// outro
	'outro/subtitles': json('subtitles/outro', { type: 'subtitles' }),
	'outro/audios': audio('audios/outro'),

	// Theatre projects' state
	theatre: json('theatre/*'),
};
