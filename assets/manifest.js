const png = (path, arg = {}) => ({ url: `/assets/${path}.png`, opts: arg });
const tp = (path) => ({ data: `/assets/${path}.json`, url: `/assets/${path}.png` }); // prettier-ignore
const msdf = (path) => ({ data: `/assets/${path}.json`, url: `/assets/${path}.png` }); // prettier-ignore
const glb = (path) => ({ url: `/assets/${path}.glb` });

export default {
	'msdf-font/VCR_OSD_MONO': msdf('fonts/msdf/VCR_OSD_MONO'),
	scene1: glb('models/scene1'),
	'blue-noise': png('canvas/blue-noise', { repeat: true }),
};
