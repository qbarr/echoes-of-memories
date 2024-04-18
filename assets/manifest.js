const png = path => ({ url: `/assets/${ path }.png` });
const tp = path => ({ data: `/assets/${ path }.json`, url: `/assets/${ path }.png` });
const glb = path => ({ url: `/assets/${ path }.glb` });

export default {};
