const img = (path, arg = {}) => ({
	url: path,
	opts: arg,
	type: 'img',
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
const copy = (path, arg = {}, type = null) => ({ url: path, opts: arg, type });

const positional = (path) => ({
	url: `${path}/*.[mp3|wav|ogg]`,
	opts: { type: 'positional' },
	type: 'audio',
});
const vocal = (path) => ({
	url: `${path}/*.[mp3|wav|ogg]`,
	opts: { type: 'vocal' },
	type: 'audio',
});
const ambiant = (path) => ({
	url: `${path}/*.[mp3|wav|ogg]`,
	opts: { type: 'ambiant' },
	type: 'audio',
});
const subtitles = (path) => ({
	url: `${path}/*.json`,
	opts: { type: 'subtitles' },
	type: 'json',
});

export default {
	'msdf-font/VCR_OSD_MONO': msdf('msdf/VCR_OSD_MONO'),

	// scene1: glb('models/scene1'),
	noises: img('data-textures/*.png', { repeat: true }),
	interface: img('interface/*.*'),
	luts: copy(
		'luts/*.[png|jpg]',
		{
			repeat: false,
			flipY: false,
			wrapS: 1001,
			wrapT: 1001,
			nearest: true,
		},
		'lut',
	),

	boat: glb('scenes/boat'),
	// Chambre
	'chambre-model': glb('scenes/chambre/model'),
	'chambre/textures': ktx2('scenes/chambre/*', { flipY: false }),

	'sound/positions': positional('audios/positional/*'),
	'sound/vocals': vocal('audios/vocals/*'),
	subtitles: subtitles('subtitles/export/*'),
};
