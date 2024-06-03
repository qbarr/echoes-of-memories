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

export default {
	'msdf-font/VCR_OSD_MONO': msdf('msdf/VCR_OSD_MONO'),
	scene1: glb('models/scene1'),
	chambre: glb('models/chambre'),
	noises: img('canvas/*.png', { repeat: true }),
	luts: img('luts/*.png'),
	// 'blue-noise': png('canvas/blue-noise.png', { repeat: true }),
};
