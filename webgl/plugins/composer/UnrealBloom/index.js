import { webgl } from '#webgl/core';
import { GLSL3, NoBlending, Vector2, Vector3, WebGLRenderTarget } from 'three';

import { storageSync, w } from '#utils/state';
import createBuffer from '#webgl/utils/createBuffer.js';
import createFilter from '#webgl/utils/createFilter.js';
import { wUniform } from '#webgl/utils/Uniform.js';

import LuminosityPass from './LuminosityPass.frag?hotshader';
import UnrealBloomBlurPass from './UnrealBloomBlurPass.frag?hotshader';
import UnrealBloomCompositePass from './UnrealBloomCompositePass.frag?hotshader';

const BlurDirectionX = new Vector2(1, 0);
const BlurDirectionY = new Vector2(0, 1);
const DUMMY_DIR = new Vector2();
const DUMMY_RT = new WebGLRenderTarget(1, 1, { depthBuffer: false });

const DEFAULT_PARAMS = {
	threshold: 0.6,
	smoothing: 0.6,
	strength: 1.21,
	radius: 1.04,
	spread: 0.78,
};

const MAX_ITERATIONS = 3;

export const useUnrealBloomPass = (composer, { iterations = MAX_ITERATIONS } = {}) => {
	/* Params */
	// const sk = 'webgl:composer:UnrealBloom:';
	// const threshold = storageSync(sk + 'threshold', w(DEFAULT_PARAMS.threshold));
	// const smoothing = storageSync(sk + 'smoothing', w(DEFAULT_PARAMS.smoothing));
	// const strength = storageSync(sk + 'strength', w(DEFAULT_PARAMS.strength));
	// const radius = storageSync(sk + 'radius', w(DEFAULT_PARAMS.radius));
	// const spread = storageSync(sk + 'spread', w(DEFAULT_PARAMS.spread));
	const threshold = w(DEFAULT_PARAMS.threshold);
	const smoothing = w(DEFAULT_PARAMS.smoothing);
	const strength = w(DEFAULT_PARAMS.strength);
	const radius = w(DEFAULT_PARAMS.radius);
	const spread = w(DEFAULT_PARAMS.spread);

	const enabled = w(true);

	const { buffers, filters, uniforms, defines } = composer;

	let texture = DUMMY_RT.texture;

	const api = {
		threshold,
		smoothing,
		strength,
		radius,
		spread,

		iterations: w(iterations),

		get texture() {
			return texture;
		},

		resize,
		render,
		/// #if __DEBUG__
		devtools,
		/// #endif
	};
	composer.$unrealBloom = api;

	/* Private */
	const blurBuffersHorizontal = [];
	const blurBuffersVertical = [];

	const { $threeRenderer, $fbo } = webgl;

	buffers.luminosity = $fbo.createBuffer({
		name: 'Luminosity',
		depth: false,
		alpha: false,
	});
	buffers.bloom = $fbo.createBuffer({
		name: 'UnrealBloom',
		alpha: false,
	});

	let scale = 0.5;
	for (let i = 0, l = MAX_ITERATIONS; i < l; i++) {
		const rtHor = createBuffer({
			name: `UnrealBloom:HorizontalBlur#${i}`,
			alpha: true,
			scale,
			depth: false,
		});
		const rtVer = createBuffer({
			name: `UnrealBloom:VerticalBlur#${i}`,
			alpha: true,
			scale,
			depth: false,
		});

		scale *= 0.5;

		blurBuffersHorizontal.push(rtHor);
		blurBuffersVertical.push(rtVer);
	}

	// Luminosity high pass material
	filters.luminosity = createFilter({
		uniforms: {
			...uniforms,
			...wUniform('uThreshold', threshold),
			...wUniform('uSmoothing', smoothing),
		},
		defines: { ...defines },
		blending: NoBlending,
		toneMapped: false,
		depthTest: false,
		depthWrite: false,
	});
	LuminosityPass.use(filters.luminosity.material);

	// Separable Gaussian blur materials
	filters.blurs = [];
	const kernelSizeArray = [3, 7, 11];

	for (let i = 0; i < MAX_ITERATIONS; i++) {
		const kernelRadius = kernelSizeArray[i];
		const filter = createFilter({
			uniforms: {
				...uniforms,
				uDirection: { value: new Vector2(0.5, 0.5) },
				uResolution: { value: new Vector2() },
				tMap: { value: DUMMY_RT.texture },
			},
			defines: {
				...defines,
				KERNEL_RADIUS: kernelRadius,
				SIGMA: kernelRadius,
			},
			blending: NoBlending,
			depthTest: false,
			depthWrite: false,
			glslVersion: GLSL3,
		});
		UnrealBloomBlurPass.use(filter.material);
		filters.blurs.push(filter);
	}

	// Unreal bloom composite material
	const bloomFactors = [1, 0.6, 0.2];
	const bloomTintColors = [
		new Vector3(0, 1, 0),
		new Vector3(1, 0, 1),
		new Vector3(1, 1, 1),
	];

	filters.bloom = createFilter({
		defines: {
			...defines,
			NUM_MIPS: MAX_ITERATIONS,
		},
		uniforms: {
			...uniforms,
			tBlur1: { value: blurBuffersVertical[0].texture },
			tBlur2: { value: blurBuffersVertical[1].texture },
			tBlur3: { value: blurBuffersVertical[2].texture },
			...wUniform('uBloomStrength', strength),
			...wUniform('uBloomRadius', radius),
			uBloomFactors: { value: bloomFactors },
			uBloomTintColors: { value: bloomTintColors },
		},
		blending: NoBlending,
		depthTest: false,
		depthWrite: false,
		glslVersion: GLSL3,
	});
	UnrealBloomCompositePass.use(filters.bloom.material);

	Object.assign(uniforms, {
		tBloom: { value: texture, type: 't' },
	});

	webgl.$renderer.drawingBufferSize.watchImmediate(resize);

	function resize({ width, height }) {
		let w = width;
		let h = height;
		for (let i = 0, l = MAX_ITERATIONS; i < l; i++) {
			filters.blurs[i].uniforms.uResolution.value.set(w, h);
			w = Math.floor(w * 0.5);
			h = Math.floor(h * 0.5);
		}
	}

	function render(scene, renderer) {
		if (!enabled.value) {
			uniforms.tBloom.value = DUMMY_RT.texture;
			return;
		}

		renderer = renderer ?? $threeRenderer;

		// Extract bright areas
		renderer.setRenderTarget(buffers.luminosity);
		filters.luminosity.render();

		// Blur all the mips progressively
		let inputRT = buffers.luminosity;

		// clean all buffers
		for (let i = 0; i < MAX_ITERATIONS; i++) {
			const bufferHor = blurBuffersHorizontal[i];
			const bufferVer = blurBuffersVertical[i];

			renderer.setRenderTarget(bufferHor);
			renderer.clear();
			renderer.setRenderTarget(bufferVer);
			renderer.clear();
		}

		for (let i = 0; i < api.iterations.value; i++) {
			const filter = filters.blurs[i];
			const bufferHor = blurBuffersHorizontal[i];
			const bufferVer = blurBuffersVertical[i];

			DUMMY_DIR.copy(BlurDirectionX).multiplyScalar(spread.value);

			filter.uniforms.tMap.value = inputRT.texture;
			filter.uniforms.uDirection.value = DUMMY_DIR;
			renderer.setRenderTarget(bufferHor);
			filter.render();

			DUMMY_DIR.copy(BlurDirectionY).multiplyScalar(spread.value);

			filter.uniforms.tMap.value = bufferHor.texture;
			filter.uniforms.uDirection.value = DUMMY_DIR;
			renderer.setRenderTarget(bufferVer);
			filter.render();

			inputRT = bufferVer;
		}

		// Composite all the mips
		renderer.setRenderTarget(buffers.bloom);
		filters.bloom.render();
		texture = buffers.bloom.texture;
		uniforms.tBloom.value = texture;
	}

	/// #if __DEBUG__
	function devtools(_gui) {
		const gui = _gui.addFolder({ title: '💥 UnrealBloom' });

		gui.addBinding(enabled, 'value', { label: 'Enabled' });

		const opts = { min: 0, max: 1, step: 0.01 };

		gui.addBinding(threshold, 'value', { label: 'Threshold', ...opts });
		gui.addBinding(smoothing, 'value', { label: 'Smoothing', ...opts });
		gui.addBinding(strength, 'value', { label: 'Strength', ...opts, max: 3 });
		gui.addBinding(radius, 'value', { label: 'Radius', ...opts, max: 2 });
		gui.addBinding(spread, 'value', { label: 'Spread', ...opts, max: 2 });

		gui.addButton({ title: 'Reset' }).on('click', () => {
			threshold.set(DEFAULT_PARAMS.threshold, true);
			smoothing.set(DEFAULT_PARAMS.smoothing, true);
			strength.set(DEFAULT_PARAMS.strength, true);
			radius.set(DEFAULT_PARAMS.radius, true);
			spread.set(DEFAULT_PARAMS.spread, true);
		});
	}
	/// #endif

	return api;
};
