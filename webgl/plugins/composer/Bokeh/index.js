import { webgl } from '#webgl/core/index.js';
import { GLSL3, NoBlending, WebGLRenderTarget } from 'three';

import { w } from '#utils/state/index.js';
import { uniform, wUniform } from '#webgl/utils/Uniform.js';
import createFilter from '#webgl/utils/createFilter.js';

import BokehPass from './BokehPass.frag?hotshader';

const DUMMY_RT = new WebGLRenderTarget(1, 1, { depthBuffer: false });

export const useBokehPass = (composer) => {
	const { buffers, filters, uniforms, defines } = composer;

	const enabled = w(true);
	const amount = w(1.239);
	const strength = w(0.85);

	let texture = DUMMY_RT.texture;
	const api = {
		enabled,

		amount,
		strength,

		get texture() {
			return texture;
		},

		render,
		/// #if __DEBUG__
		devtools,
		/// #endif
	};
	composer.$bokeh = api;

	/* Private */
	const { $threeRenderer, $fbo } = webgl;

	const buffer = (buffers.bokeh = $fbo.createBuffer({ name: 'Bokeh' }));

	const filter = (filters.bokeh = createFilter({
		uniforms: {
			...uniforms,
			...wUniform('uAmount', amount),
			...wUniform('uStrength', strength),
		},
		defines: { ...defines },
		glslVersion: GLSL3,
		blending: NoBlending,
		depthTest: false,
		depthWrite: false,
	}));
	BokehPass.use(filter.material);

	// Object.assign(uniforms, {
	// 	tBokeh: { value: texture, type: 't' },
	// });

	function render(scene, renderer) {
		if (!enabled.value) return;

		renderer = renderer ?? $threeRenderer;

		renderer.setRenderTarget(buffer);
		renderer.clear();
		filter.render();
		texture = buffer.texture;
		uniforms.tMap.value = texture;
		// uniforms.tBokeh.value = texture;
	}

	/// #if __DEBUG__
	function devtools(_gui) {
		const gui = _gui.addFolder({ title: '🫨 Bokeh' });

		gui.addBinding(enabled, 'value', { label: 'Enabled' });
		gui.addBinding(amount, 'value', {
			label: 'Amount',
			min: 0,
			max: 3,
			step: 0.001,
		});
		gui.addBinding(strength, 'value', {
			label: 'Strength',
			min: 0,
			max: 6,
		});
	}
	/// #endif

	return api;
};
