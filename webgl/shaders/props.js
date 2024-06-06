import { Vector4 } from 'three';

export function useShaderProps(webgl) {
	const u = (webgl.uniforms = {
		uTime: { type: 'f', value: 0 },
		uResolution: { type: 'v4', value: new Vector4() },
	});

	const d = (webgl.defines = {});

	const { beforeSetup, afterSetup, beforeUpdate } = webgl.$hooks;

	beforeSetup.watchOnce(() => {
		if (webgl.$app.$device.type.mobile) d.IS_MOBILE = 1;
	});

	afterSetup.watchOnce(() => {
		beforeUpdate.watch(() => (u.uTime.value += webgl.$time.dt));
		webgl.$renderer.drawingBufferSize.watchImmediate((dbs) => {
			const { x: width, y: height } = dbs;
			const { pixelRatio, ratio } = webgl.$viewport;
			u.uResolution.value.set(width, height, 1 / pixelRatio.value, ratio.value);
		});
	});
}
