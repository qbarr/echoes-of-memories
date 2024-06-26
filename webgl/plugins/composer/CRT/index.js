import { webgl } from '#webgl/core';
import { NoBlending, Vector2, WebGLRenderTarget } from 'three';

import { w } from '#utils/state';
import { wUniform } from '#webgl/utils/Uniform.js';
import createFilter from '#webgl/utils/createFilter.js';

import CRTPass from './CRTPass.frag?hotshader';
import { raftween } from '#utils/anim/raftween.js';

const DUMMY_RT = new WebGLRenderTarget(1, 1, { depthBuffer: false });

export const useCRTPass = (composer) => {
	const { buffers, filters, uniforms, defines } = composer;

	const enabled = w(true);
	enabled.watchImmediate((v) => (uniforms.CRT_DISABLED.value = v ? 0 : 1));

	const scanLines = w(new Vector2(0.25, 0.23)); // Opacity, Flicker
	const padding = w(new Vector2(0.2, 0)); // x, y
	const fishEye = w(new Vector2(0.1, 0.24)); // x, y
	const vignette = w(new Vector2(130, 0.8)); // Threshold, Smoothness
	const interferences = w(new Vector2(0.6, 0.002)); // Global Level, Big Flicker
	let texture = DUMMY_RT.texture;
	let glitchTween = { x: null, y: null };

	const api = {
		enabled,

		scanLines,
		padding,
		fishEye,
		vignette,
		interferences,

		get texture() {
			return texture;
		},
		unglitch,
		glitch,
		render,
		/// #if __DEBUG__
		devtools,
		/// #endif
	};
	composer.$crt = api;

	/* Private */
	const { $threeRenderer, $fbo } = webgl;

	const buffer = (buffers.crt = $fbo.createBuffer({
		name: 'CRT',
		depth: false,
		alpha: false,
		scale: 0.75,
	}));

	const filter = (filters.crt = createFilter({
		uniforms: {
			...uniforms,
			...wUniform('uScanLines', scanLines),
			...wUniform('uPadding', padding),
			...wUniform('uFishEye', fishEye),
			...wUniform('uVignette', vignette),
			...wUniform('uInterferences', interferences),
		},
		defines: { ...defines },
		blending: NoBlending,
	}));
	CRTPass.use(filter.material);

	// Object.assign(uniforms, {
	// 	tCRT: { value: texture, type: 't' },
	// });

	function render(scene, renderer) {
		if (!enabled.value) {
			// uniforms.tCRT.value = DUMMY_RT.texture;
			return;
		}

		renderer = renderer ?? $threeRenderer;
		glitchTween['x']?.update(webgl.$time.dt * 0.001);
		glitchTween['y']?.update(webgl.$time.dt * 0.001);
		renderer.setRenderTarget(buffer);
		renderer.clear();
		filter.render();
		texture = buffer.texture;
		uniforms.tMap.value = texture;
		// uniforms.tCRT.value = texture;
		renderer.setRenderTarget(null);
	}

	function glitch() {
		return Promise.all[
			glitchFromTo(interferences.value.x, 70)
			// glitchFromTo(interferences.value.y, 20, 'y')
		];
	}

	function unglitch() {
		return Promise.all[
			glitchFromTo(interferences.value.x, 0)
			// glitchFromTo(interferences.value.y, 0.002, 'y')
		];
	}

	function glitchFromTo(from, to, property = 'x') {
		return new Promise((resolve) => {
			glitchTween[property] = raftween({
				from,
				to,
				target: interferences.value,
				property,
				duration: 4,
				onComplete: resolve,
			});
			glitchTween[property].play();
		});
	}

	/// #if __DEBUG__
	function devtools(_gui) {
		const gui = _gui.addFolder({ title: '📼 CRT' });
		gui.add(enabled, 'value', { label: 'Enabled' });

		const opts = { min: 0, max: 1, step: 0.01 };

		gui.addBinding(padding, 'value', { label: 'Padding', ...opts, max: 1 });
		gui.addBinding(fishEye, 'value', { label: 'Fish Eye', ...opts });
		gui.addSeparator();
		gui.addBinding(scanLines.value, 'x', { label: 'Scan Lines Opacity', ...opts }).on(
			'change',
			({ value }) => {
				scanLines.value.x = value;
				scanLines.emit();
			},
		);
		gui.addBinding(scanLines.value, 'y', { label: 'Scan Lines Flicker', ...opts }).on(
			'change',
			({ value }) => {
				scanLines.value.y = value;
				scanLines.emit();
			},
		);
		gui.addSeparator();
		gui.addBinding(vignette.value, 'x', {
			label: 'Vignette Threshold',
			min: 0,
			max: 200,
			step: 1,
		});
		gui.addBinding(vignette.value, 'y', { label: 'Vignette Smoothness', ...opts });
		gui.addSeparator();
		gui.addBinding(interferences.value, 'x', {
			label: 'Interferences 1',
			...opts,
			max: 3,
		}).on('change', ({ value }) => {
			interferences.value.x = value;
			interferences.emit();
		});
		gui.addBinding(interferences.value, 'y', {
			label: 'Interferences 2',
			...opts,
			max: 1,
			step: 0.001,
		}).on('change', ({ value }) => {
			interferences.value.y = value;
			interferences.emit();
		});
	}
	/// #endif

	return api;
};
