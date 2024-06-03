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
	type: 'texture',
});
const copy = (path) => ({ url: path });

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
	scene1: glb('models/scene1'),
	chambre: glb('models/chambre'),
	noises: img('canvas/*.png', { repeat: true }),
	luts: img('luts/*.png'),
	// 'blue-noise': png('canvas/blue-noise.png', { repeat: true }),

	'sound/positions': positional('audios/positional/*'),
	'sound/vocals': vocal('audios/vocals/*'),

	subtitles: subtitles('subtitles/export/*'),
};
