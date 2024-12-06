import { w } from '#utils/state/index.js';
import { webgl } from '#webgl/core/index.js';
import createBuffer from '#webgl/utils/createBuffer.js';
import createFilter from '#webgl/utils/createFilter.js';
import pingPongRT from '#webgl/utils/pingPongBuffer.js';

import { wUniform } from '#webgl/utils/Uniform.js';
import { RenderTarget } from 'three';
import AfterImagePass from './AfterImagePass.frag?hotshader';

const DUMMY_RT = new RenderTarget(1, 1);

export const useAfterImagePass = (composer) => {
	const { filters, uniforms, defines } = composer;

	let saturationTween = null;
	/* Params */
	const enabled = w(true);
	const strength = w(0.97);

	const api = {
		enabled,
		strength,

		render,
		/// #if __DEBUG__
		devtools,
		/// #endif
	};
	composer.$afterImage = api;

	const { $threeRenderer, $fbo } = webgl;

	/* Init */
	const pingPongBuffer = pingPongRT({
		name: 'AfterImage',
		depth: false,
		stencil: false,
		scale: .3
	});
	const buffer = $fbo.createBuffer({
		name: 'AfterImage',
		depth: false,
		stencil: false,
		scale: .3
	});
	composer.buffers.afterImage = buffer;

	const filter = createFilter({
		uniforms: {
			...uniforms,
			tMap: pingPongBuffer.uniform,
			...wUniform('uStrength', strength),
		},
		defines: {
			...defines,
		},
	});
	AfterImagePass.use(filter.material);
	composer.filters.afterImage = filter;

	Object.assign(uniforms, {
		tAfterImage: buffer.texture,
	});

	/* Update */
	function render(scene, renderer) {
		if (!enabled.value) {
			buffer.texture = DUMMY_RT.texture;
			uniforms.tAfterImage.value = buffer.texture;
			return;
		}
		renderer = renderer ?? $threeRenderer;

		pingPongBuffer.bind();
		renderer.clear();
		scene.triggerRender();
		filter.render();
		pingPongBuffer.unbind();
		pingPongBuffer.swap();

		buffer.texture = pingPongBuffer.readable.texture;
		uniforms.tAfterImage.value = buffer.texture;
	}

	/// #if __DEBUG__
	function devtools(_gui) {
		const gui = _gui.addFolder({ title: '🪞 After Image' });

		const opts = { min: 0, max: 1, step: 0.01 };

		gui.addBinding(enabled, 'value', { label: 'Enabled' });
		gui.addBinding(strength, 'value', { label: 'Strength', ...opts });
	}
	/// #endif

	return api;
};
