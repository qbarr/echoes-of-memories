const png = (path, arg = {}) => ({
	url: path,
	opts: arg,
	type: 'png',
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

export default {
	'msdf-font/VCR_OSD_MONO': msdf('msdf/**/'),
	// 'msdf-font/VCR_OSD_MONO': msdf('msdf/VCR_OSD_MONO'),
	// 'msdf-font/POUET_LA_FONT': msdf('msdf/POUET_LA_FONT'),
	// 'msdf-font': msdf('msdf/**'),
	scene1: glb('models/scene1'),
	noises: png('canvas/*.png', { repeat: true }),
	// 'blue-noise': png('canvas/blue-noise.png', { repeat: true }),
};
