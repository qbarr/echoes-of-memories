import { w } from '#utils/state';
import { webgl } from '#webgl/core';
import createFilter from '#webgl/utils/createFilter.js';
import { Vector2, WebGLRenderTarget } from 'three';

import CRTPass from './CRTPass.frag?hotshader';
import VHSPass from './VHSPass.frag?hotshader';

const DUMMY_RT = new WebGLRenderTarget(1, 1, { depthBuffer: false });

export const useVHSPass = (composer) => {
	const { buffers, filters, uniforms, defines } = composer;

	const curvature = w(0.75);
	const scanLines = w(0.75);
	const padding = w(0.75);
	const enabled = w(true);

	let texture = DUMMY_RT.texture;

	const api = {
		enabled,
		curvature,

		get texture() {
			return texture;
		},

		render,
		/// #if __DEBUG__
		devtools,
		/// #endif
	};
	composer.$vhs = api;

	/* Private */
	const { $threeRenderer, $fbo } = webgl;

	const buffer = (buffers.vhs = $fbo.createBuffer({
		name: 'VHS',
		depth: false,
		alpha: false,
		scale: 0.5,
	}));

	const filter = (filters.vhs = createFilter({
		uniforms: {
			...uniforms,
			uCurvature: { value: new Vector2().setScalar(curvature.value) },
			uScanLines: { value: scanLines.value },
			uPadding: { value: new Vector2().setScalar(padding.value) },
		},
		defines: { ...defines },
	}));
	CRTPass.use(filter.material);

	curvature.watchImmediate((v) => filter.uniforms.uCurvature.value.setScalar(v));
	scanLines.watchImmediate((v) => (filter.uniforms.uScanLines.value = v));

	Object.assign(uniforms, {
		tVHS: { value: texture, type: 't' },
	});

	function render(scene, renderer) {
		if (!enabled.value) return;

		renderer = renderer ?? $threeRenderer;

		renderer.setRenderTarget(buffer);
		renderer.clear();
		filter.render();
		texture = buffer.texture;
		uniforms.tMap.value = texture;
		renderer.setRenderTarget(null);
	}

	/// #if __DEBUG__
	function devtools(_gui) {
		const gui = _gui.addFolder({ title: '📼 VHS' });
		gui.add(enabled, 'value', { label: 'Enabled' });
		gui.add(curvature, 'value', {
			label: 'Curvature',
			min: 0,
			max: 1,
			step: 0.01,
		}).on('change', ({ value }) => filter.uniforms.uCurvature.value.setScalar(value));

		gui.add(scanLines, 'value', {
			label: 'Scan Lines',
			min: 0,
			max: 1,
			step: 0.01,
		}).on('change', ({ value }) => (filter.uniforms.uScanLines.value = value));

		gui.add(padding, 'value', {
			label: 'Padding',
			min: 0,
			max: 1,
			step: 0.01,
		}).on('change', ({ value }) => filter.uniforms.uPadding.value.setScalar(value));
	}
	/// #endif

	return api;
};
