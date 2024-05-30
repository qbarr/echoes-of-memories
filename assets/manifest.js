// const png = (path, arg = {}) => ({ url: `/assets/${path}.png`, opts: arg });
// const tp = (path) => ({ data: `/assets/${path}.json`, url: `/assets/${path}.png` }); // prettier-ignore
// const msdf = (path) => ({ data: `/assets/${path}.json`, url: `/assets/${path}.png` }); // prettier-ignore
// const glb = (path) => ({ url: `/assets/${path}.glb` });
// const ktx2 = (path, arg = {}) => ({ url: `/assets/${path}.ktx2`, opts: arg });
const png = (path, arg = {}) => ({ url: `/assets/${path}.png`, opts: arg });
// const tp = (path, args = {}) => ({
// 	data: `/assets/${path}.json`,
// 	atlas: `/assets/${path}.png`,
// 	type: 'spritesheet',
// 	opts: args,
// });
const msdf = (path, args = {}) => ({
	// data: `/assets/${path}.json`,
	// atlas: `/assets/${path}.png`,
	url: `/assets/${path}/*`,
	type: 'msdf',
	opts: args,
});
const glb = (path) => ({ url: `/assets/${path}.glb` });
const ktx2 = (path, arg = {}) => ({ url: `/assets/${path}.ktx2`, opts: arg });

export default {
	'msdf-font/VCR_OSD_MONO': msdf('msdf/VCR_OSD_MONO'),
	scene1: glb('models/scene1'),
	'blue-noise': png('canvas/blue-noise', { repeat: true }),
};
