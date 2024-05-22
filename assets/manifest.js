const png = path => ({ url: `/assets/${ path }.png` });
const tp = path => ({ data: `/assets/${ path }.json`, url: `/assets/${ path }.png` });
const msdf = path => ({ data: `/assets/${ path }.json`, url: `/assets/${ path }.png` });
const glb = path => ({ url: `/assets/${ path }.glb` });

export default {
	'msdf-font/VCR_OSD_MONO': msdf('fonts/msdf/VCR_OSD_MONO'),
};
