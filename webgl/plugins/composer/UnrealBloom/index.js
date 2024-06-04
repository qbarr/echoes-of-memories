import { webgl } from '#webgl/core/index.js';
import { GLSL3, NoBlending, Vector2, Vector3, WebGLRenderTarget } from 'three';

import { storageSync, w } from '#utils/state';
import createFilter from '#webgl/utils/createFilter.js';
import createBuffer from '#webgl/utils/createBuffer.js';

import LuminosityPass from './LuminosityPass.frag?hotshader';
import UnrealBloomBlurPass from './UnrealBloomBlurPass.frag?hotshader';
import UnrealBloomCompositePass from './UnrealBloomCompositePass.frag?hotshader';

const BlurDirectionX = new Vector2(1, 0);
const BlurDirectionY = new Vector2(0, 1);
const DUMMY_DIR = new Vector2();
const DUMMY_RT = new WebGLRenderTarget(1, 1, { depthBuffer: false });

const defaultParams = {
	threshold: 0.75, // 0.13, // 0.57,
	smoothing: 0.51, // 0.47, // 0.68,
	strength: 0.68, // 1.08, // 1.6,
	radius: 1.28, // 1.28, // 0.78,
	spread: 1.24, // 0.65, // 0.65,
};

export const useUnrealBloomPass = (composer, { iterations = 5 } = {}) => {
	/* Params */
	const sk = 'webgl:composer:UnrealBloom:';
	const threshold = storageSync(sk + 'threshold', w(defaultParams.threshold));
	const smoothing = storageSync(sk + 'smoothing', w(defaultParams.smoothing));
	const strength = storageSync(sk + 'strength', w(defaultParams.strength));
	const radius = storageSync(sk + 'radius', w(defaultParams.radius));
	const spread = storageSync(sk + 'spread', w(defaultParams.spread));

	const enabled = w(true);

	const { buffers, filters, uniforms, defines } = composer;

	let bloomTexture = DUMMY_RT.texture;

	const api = {
		threshold,
		smoothing,
		strength,
		radius,

		get texture() {
			return bloomTexture;
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
	const nMips = iterations;

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

	for (let i = 0, l = nMips; i < l; i++) {
		const rtHor = createBuffer({
			name: `UnrealBloom:HorizontalBlur#${i}`,
			alpha: true,
			scale: 0.5,
			depth: false,
		});
		const rtVer = createBuffer({
			name: `UnrealBloom:VerticalBlur#${i}`,
			alpha: true,
			scale: 0.5,
			depth: false,
		});

		blurBuffersHorizontal.push(rtHor);
		blurBuffersVertical.push(rtVer);
	}

	// Luminosity high pass material
	const lumFilter = (filters.luminosity = createFilter({
		uniforms: {
			...uniforms,
			uThreshold: { value: threshold.value },
			uSmoothing: { value: smoothing.value },
		},
		defines,
		blending: NoBlending,
		toneMapped: false,
		depthTest: false,
		depthWrite: false,
	}));
	LuminosityPass.use(lumFilter.material);

	threshold.watch((v) => (lumFilter.uniforms.uThreshold.value = v));
	smoothing.watch((v) => (lumFilter.uniforms.uSmoothing.value = v));

	// Separable Gaussian blur materials
	const blurFilters = (filters.blurs = []);
	const kernelSizeArray = [3, 5, 7, 9, 11];

	for (let i = 0; i < nMips; i++) {
		const kernelRadius = kernelSizeArray[i];
		const filter = createFilter({
			// fragmentShader: UnrealBloomBlurPass,
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
		blurFilters.push(filter);
	}

	// Unreal bloom composite material
	const bloomFactors = [1, 0.8, 0.6, 0.4, 0.2];
	const bloomTintColors = [
		new Vector3(1, 1, 1),
		new Vector3(1, 1, 1),
		new Vector3(1, 1, 1),
		new Vector3(1, 1, 1),
		new Vector3(1, 1, 1),
	];

	const bloomFilter = (filters.bloom = createFilter({
		// fragmentShader: UnrealBloomCompositePass,
		defines: {
			...defines,
			NUM_MIPS: nMips,
		},
		uniforms: {
			...uniforms,
			tBlur1: { value: (blurBuffersVertical[0] ?? DUMMY_RT).texture },
			tBlur2: { value: (blurBuffersVertical[1] ?? DUMMY_RT).texture },
			tBlur3: { value: (blurBuffersVertical[2] ?? DUMMY_RT).texture },
			tBlur4: { value: (blurBuffersVertical[3] ?? DUMMY_RT).texture },
			tBlur5: { value: (blurBuffersVertical[4] ?? DUMMY_RT).texture },
			uBloomStrength: { value: strength.value },
			uBloomRadius: { value: radius.value },
			uBloomFactors: { value: bloomFactors },
			uBloomTintColors: { value: bloomTintColors },
		},
		blending: NoBlending,
		depthTest: false,
		depthWrite: false,
		glslVersion: GLSL3,
	}));
	UnrealBloomCompositePass.use(bloomFilter.material);

	strength.watch((v) => (bloomFilter.uniforms.uBloomStrength.value = v));
	radius.watch((v) => (bloomFilter.uniforms.uBloomRadius.value = v));

	Object.assign(uniforms, {
		tBloom: { value: buffers.bloom.texture, type: 't' },
	});

	function resize(width, height) {
		buffers.luminosity.setSize(width, height);
		buffers.bloom.setSize(width, height);

		let w = width;
		let h = height;
		for (let i = 0, l = nMips; i < l; i++) {
			blurBuffersHorizontal[i].setSize(w, h);
			blurBuffersVertical[i].setSize(w, h);
			blurFilters[i].uniforms.uResolution.value.set(w, h);

			w = Math.floor(w * 0.5);
			h = Math.floor(h * 0.5);
		}
	}

	function render(scene, renderer) {
		if (!enabled.value) return;

		renderer = renderer ?? $threeRenderer;

		// Extract bright areas
		renderer.setRenderTarget(buffers.luminosity);
		scene?.triggerRender();
		filters.luminosity.render();

		// Blur all the mips progressively
		let inputRT = buffers.luminosity;

		for (let i = 0; i < nMips; i++) {
			const filter = blurFilters[i];
			const bufferHor = blurBuffersHorizontal[i];
			const bufferVer = blurBuffersVertical[i];

			DUMMY_DIR.copy(BlurDirectionX).multiplyScalar(spread.value);

			filter.uniforms.tMap.value = inputRT.texture;
			filter.uniforms.uDirection.value = DUMMY_DIR;
			renderer.setRenderTarget(bufferHor);
			scene?.triggerRender();
			filter.render();

			DUMMY_DIR.copy(BlurDirectionY).multiplyScalar(spread.value);

			filter.uniforms.tMap.value = bufferHor.texture;
			filter.uniforms.uDirection.value = DUMMY_DIR;
			renderer.setRenderTarget(bufferVer);
			scene?.triggerRender();
			filter.render();

			inputRT = bufferVer;
		}

		// Composite all the mips
		renderer.setRenderTarget(buffers.bloom);
		bloomFilter.render();
		bloomTexture = buffers.bloom.texture;
		uniforms.tBloom.value = bloomTexture;
	}

	/// #if __DEBUG__
	function devtools(_gui) {
		const gui = _gui.addFolder({ title: 'UnrealBloom' });

		gui.addBinding(threshold, 'value', {
			label: 'Threshold',
			min: 0,
			max: 1,
			step: 0.01,
		});
		gui.addBinding(smoothing, 'value', {
			label: 'Smoothing',
			min: 0,
			max: 1,
			step: 0.01,
		});
		gui.addBinding(strength, 'value', {
			label: 'Strength',
			min: 0,
			max: 3,
			step: 0.01,
		});
		gui.addBinding(radius, 'value', {
			label: 'Radius',
			min: 0,
			max: 2,
			step: 0.01,
		});
		gui.addBinding(spread, 'value', {
			label: 'Spread',
			min: 0,
			max: 2,
			step: 0.01,
		});

		gui.addButton({ title: 'Reset' }).on('click', () => {
			threshold.set(defaultParams.threshold, true);
			smoothing.set(defaultParams.smoothing, true);
			strength.set(defaultParams.strength, true);
			radius.set(defaultParams.radius, true);
			spread.set(defaultParams.spread, true);
		});
	}
	/// #endif

	return api;
};
