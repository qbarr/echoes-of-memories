import { webgl } from '#webgl/core/index.js';
import { WebGLRenderTarget } from 'three';

import { w } from '#utils/state/index.js';
import { wUniform } from '#webgl/utils/Uniform.js';
import createFilter from '#webgl/utils/createFilter.js';

import RGBShiftPass from './RGBShiftPass.frag?hotshader';

const DUMMY_RT = new WebGLRenderTarget(1, 1, { depthBuffer: false });

export const useRGBShiftPass = (composer) => {
	const { buffers, filters, uniforms, defines } = composer;

	const enabled = w(true);
	const amount = w(0.002);
	const angle = w(0);

	let texture = DUMMY_RT.texture;
	const api = {
		enabled,

		amount,
		angle,

		get texture() {
			return texture;
		},

		render,
		/// #if __DEBUG__
		devtools,
		/// #endif
	};
	composer.$rgbShift = api;

	/* Private */
	const { $threeRenderer, $fbo } = webgl;

	const buffer = (buffers.rgbShift = $fbo.createBuffer({ name: 'RGBShift' }));

	const filter = (filters.rgbShift = createFilter({
		uniforms: {
			...uniforms,
			...wUniform('uAmount', amount),
			...wUniform('uAngle', angle),
		},
		defines: { ...defines },
	}));
	RGBShiftPass.use(filter.material);

	function render(scene, renderer) {
		if (!enabled.value) return;

		renderer = renderer ?? $threeRenderer;

		renderer.setRenderTarget(buffer);
		renderer.clear();
		filter.render();
		texture = buffer.texture;
		uniforms.tMap.value = texture;
		renderer.setRenderTarget(null);

		return buffer.texture;
	}

	/// #if __DEBUG__
	function devtools(_gui) {
		const gui = _gui.addFolder({ title: '🚦 RGBShift' });

		gui.addBinding(enabled, 'value', { label: 'Enabled' });
		gui.addBinding(amount, 'value', {
			label: 'Amount',
			min: 0,
			max: 0.01,
			step: 0.001,
		});
		gui.addBinding(angle, 'value', {
			label: 'Angle',
			min: 0,
			max: 2 * Math.PI,
			step: 0.1,
		});
	}
	/// #endif

	return api;
};
