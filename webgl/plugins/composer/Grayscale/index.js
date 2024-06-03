import { webgl } from '#webgl/core/index.js';
import { WebGLRenderTarget } from 'three';

import { w } from '#utils/state';
import createFilter from '#webgl/utils/createFilter.js';

import GrayscaleFragment from './GrayscaleFragment.frag?hotshader';

const DUMMY_RT = new WebGLRenderTarget(1, 1, { depthBuffer: false });

export const useGrayscale = (composer) => {
	/* Params */
	const strength = w(0);
	const enabled = w(true);

	const { buffers, filters, uniforms, defines } = composer;

	let texture = DUMMY_RT.texture;

	const api = {
		strength,

		get texture() {
			return texture;
		},

		resize,
		render,
		/// #if __DEBUG__
		devtools,
		/// #endif
	};
	composer.$grayscale = api;

	/* Private */
	const { $threeRenderer, $fbo } = webgl;

	const buffer = (buffers.grayscale = $fbo.createBuffer({
		name: 'Grayscale',
	}));
	const filter = (filters.grayscale = createFilter({ uniforms, defines }));
	GrayscaleFragment.use(filter.material);

	Object.assign(uniforms, {
		tGrayscale: { value: buffer.texture, type: 't' },
	});

	function resize(width, height) {
		buffer.setSize(width, height);
	}

	function render(scene, renderer) {
		if (!enabled.value) return;

		renderer = renderer ?? $threeRenderer;

		renderer.setRenderTarget(buffer);
		// renderer.clear();
		scene.triggerRender();
		filter.render();
		texture = buffer.texture;
	}

	/// #if __DEBUG__
	function devtools(_gui) {
		const gui = _gui.addFolder({ title: 'Grayscale' });

		gui.addBinding(strength, 'value', {
			label: 'Strength',
			min: 0,
			max: 1,
			step: 0.01,
		});
	}
	/// #endif

	return api;
};
