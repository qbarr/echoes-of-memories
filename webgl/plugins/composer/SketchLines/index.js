import { webgl } from '#webgl/core';
import { GLSL3, NoBlending, Vector2, WebGLRenderTarget } from 'three';

import { prng } from '#utils/maths/prng.js';
import { w } from '#utils/state';
import createFilter from '#webgl/utils/createFilter.js';

import SketchLinesPass from './SketchLinesPass.frag?hotshader';

const rf = prng.randomFloat;

const DUMMY_RT = new WebGLRenderTarget(1, 1);
const SKETCH_OFFSET_DELAY = 230;

export const useSketchLinesPass = (composer) => {
	const { buffers, filters, uniforms, defines } = composer;

	const enabled = w(true);

	let delay = 0;
	let texture = DUMMY_RT.texture;
	const api = {
		enabled,

		get texture() {
			return texture;
		},

		render,
		/// #if __DEBUG__
		devtools,
		/// #endif
	};
	composer.$sketchLines = api;

	/* Private */
	const { $threeRenderer, $fbo, $assets } = webgl;

	const b = (buffers.sketchLines = $fbo.createBuffer({ name: 'Sketch Lines' }));

	const f = (filters.sketchLines = createFilter({
		uniforms: {
			...uniforms,
			tCloudNoiseMap: { value: $assets.textures.noises['cloud-noise'], type: 't' },
			uCameraNear: { value: 0 },
			uCameraFar: { value: 0 },
			uSketchOffset: { value: new Vector2() },
		},
		defines: { ...defines },
		glslVersion: GLSL3,
		blending: NoBlending,
	}));
	SketchLinesPass.use(f.material);

	Object.assign(uniforms, {
		tSketchLines: { value: texture, type: 't' },
	});

	function render(scene, renderer) {
		if (!enabled.value) return (uniforms.tSketchLines.value = DUMMY_RT.texture);

		const { dt } = webgl.$time;

		delay = Math.max(0, delay - dt);
		if (delay <= 0) {
			delay = SKETCH_OFFSET_DELAY;
			f.uniforms.uSketchOffset.value.set(rf(-1, 1), rf(-1, 1));
		}

		const cam = scene.getCurrentCamera().base;
		f.uniforms.uCameraNear.value = cam.near;
		f.uniforms.uCameraFar.value = cam.far;

		renderer = renderer ?? $threeRenderer;

		renderer.setRenderTarget(b);
		renderer.clear();
		f.render();
		texture = b.texture;
		uniforms.tSketchLines.value = texture;
		renderer.setRenderTarget(null);
	}

	/// #if __DEBUG__
	function devtools(_gui) {
		const gui = _gui.addFolder({ title: '🖌️ Sketch Lines' });
		gui.add(enabled, 'value', { label: 'Enabled' });
	}
	/// #endif

	return api;
};
