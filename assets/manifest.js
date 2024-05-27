const png = path => ({ url: `/assets/${ path }.png` });
const tp = path => ({ data: `/assets/${ path }.json`, url: `/assets/${ path }.png` });
const msdf = path => ({ data: `/assets/${ path }.json`, url: `/assets/${ path }.png` });
const glb = path => ({ url: `/assets/${ path }.glb` });
const mp3 =	path => ({ url: `/assets/${ path }.mp3` });
const ogg =	path => ({ url: `/assets/${ path }.ogg` });
const wav =	path => ({ url: `/assets/${ path }.wav` });

export default {
	'msdf-font/VCR_OSD_MONO': msdf('fonts/msdf/VCR_OSD_MONO'),
	'scene1': glb('models/scene1'),

	'ocean': mp3('audios/ambiant/ocean'),
	'cameronDiaz': wav('audios/vocals/cameronDiaz'),
	'christianBale': wav('audios/vocals/christianBale'),
	'leonardoDicaprio': wav('audios/vocals/leonardoDicaprio'),
	'timotheeChalamet': wav('audios/vocals/timotheeChalamet'),
};
