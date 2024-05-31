// const png = (path, arg = {}) => ({ url: `${path}.png`, opts: arg });
// const tp = (path) => ({ data: `${path}.json`, url: `${path}.png` }); // prettier-ignore
// const msdf = (path) => ({ data: `${path}.json`, url: `${path}.png` }); // prettier-ignore
// const glb = (path) => ({ url: `${path}.glb` });
// const ktx2 = (path, arg = {}) => ({ url: `${path}.ktx2`, opts: arg });
const png = (path, arg = {}) => ({
	url: `${path}.png`,
	opts: arg,
	type: 'image',
});
const msdf = (path, args = {}) => ({
	// data: `${path}.json`,
	// atlas: `${path}.png`,
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

export default {
	// 'msdf-font/VCR_OSD_MONO': copy('msdf/**/'),
	'msdf-font/VCR_OSD_MONO': msdf('msdf/VCR_OSD_MONO'),
	scene1: glb('models/scene1'),
	noises: png('canvas/*.png', { repeat: true }),
};
