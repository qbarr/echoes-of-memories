import { storageSync, w } from '#utils/state/index.js';
import { getWebGL } from '#webgl/core/index.js';
import createFilter from '#webgl/utils/createFilter.js';
import {
	AddEquation,
	AdditiveBlending,
	CustomBlending,
	Data3DTexture,
	FloatType,
	GLSL3,
	HalfFloatType,
	LinearFilter,
	MultiplyBlending,
	NearestFilter,
	SrcAlphaFactor,
	Vector3,
} from 'three';

import LUTPass from './LUTPass.frag?hotshader';

export const useLutPass = (composer) => {
	const { filters, uniforms, defines } = composer;
	const $webgl = getWebGL();

	/* Params */
	const enabled = w(true);
	const saturation = w(1);
	const mix = w(1);
	const forcedMix = w(mix.value);

	const currentLut = storageSync('webgl:composer:lut:current', w('neutral'));

	const lut = $webgl.$assets.luts[currentLut.value];
	const texture = lut.texture3D;
	const { width, height } = texture.image;

	const api = {
		get lut() {
			return currentLut.value;
		},

		set lut(value) {
			if (value === currentLut.value) return;
			if (!$webgl.$assets.luts[value])
				return __DEBUG__ && console.warn(`LUT ${value} not found`);

			currentLut.value = value;
			set($webgl.$assets.luts[value]);
		},

		set,
		render,
		/// #if __DEBUG__
		devtools,
		/// #endif
	};
	composer.$lut = api;

	/* Init */
	const filter = createFilter({
		uniforms: {
			...uniforms,
			tLutMap: { value: texture },
			uSaturation: { value: saturation.value },
			uMix: { value: mix.value },
		},
		defines: {
			...defines,
			LUT_SIZE: Math.min(width, height).toFixed(16),
			LUT_TEXEL_WIDTH: (1.0 / width).toFixed(16),
			LUT_TEXEL_HEIGHT: (1.0 / height).toFixed(16),
			LUT_STRIP_HORIZONTAL: width > height ? 1 : 0,
			LUT_PRECISION_HIGH:
				texture.type === FloatType || texture.type === HalfFloatType
					? 1
					: 0,
		},
		glslVersion: GLSL3,
	});
	LUTPass.use(filter.material);

	function set(lut) {
		if (typeof lut === 'string') lut = $webgl.$assets.luts[lut];
		if (!lut) return;

		currentLut.set(lut.texture3D.userData.id);
		filter.uniforms.tLutMap.value = lut.texture3D;
	}

	/* Update */
	function render() {
		if (!enabled.value) mix.set(0);
		else mix.set(forcedMix.value ?? 1);

		filter.render();
	}

	/// #if __DEBUG__
	function devtools(_gui) {
		const gui = _gui.addFolder({ title: 'LUT' });

		const lutList = Object.keys($webgl.$assets.luts);

		gui.addBlade({
			label: 'Presets',
			options: lutList.map((id) => ({ text: id, value: id })),
			view: 'list',
			value: currentLut.value,
		}).on('change', ({ value }) => set(value));

		gui.addSeparator();

		gui.addBinding(enabled, 'value', { label: 'Enabled' });
		gui.addBinding(saturation, 'value', {
			label: 'Saturation',
			min: 0,
			max: 1,
			step: 0.01,
		}).on('change', () => {
			filter.uniforms.uSaturation.value = saturation.value;
		});
		gui.addBinding(mix, 'value', {
			label: 'Mix',
			min: 0,
			max: 1,
			step: 0.01,
		}).on('change', () => {
			filter.uniforms.uMix.value = mix.value;
		});
		gui.addBinding(forcedMix, 'value', {
			label: 'Forced Mix',
			min: 0,
			max: 1,
			step: 0.01,
		});
	}
	/// #endif

	return api;
};
