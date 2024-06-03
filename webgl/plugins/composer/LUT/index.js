import { w } from '#utils/state/index.js';
import { getWebGL } from '#webgl/core/index.js';
import createFilter from '#webgl/utils/createFilter.js';

import LUTFragment from './LUTFragment.frag?hotshader';

export const useLutPass = (composer) => {
	const { filters, uniforms, defines } = composer;
	const $webgl = getWebGL();

	/* Params */
	const enabled = w(false);
	const strength = w(1);

	const lutTexture = $webgl.$assets.textures['luts'].neutral;

	const api = {
		get lut() {
			return lutTexture;
		},

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
			tLutMap: { value: lutTexture },
			uStrength: { value: strength.value },
		},
		defines: {
			...defines,
			USE_LUT: 1,
		},
	});
	LUTFragment.use(filter.material);

	/* Update */
	function render() {
		if (!enabled.value) return;
		filter.render();
	}

	/// #if __DEBUG__
	function devtools(_gui) {
		const gui = _gui.addFolder({ title: 'LUT' });

		gui.addBinding(enabled, 'value', { label: 'Enabled' });
		gui.addBinding(strength, 'value', {
			label: 'Strength',
			min: 0,
			max: 1,
			step: 0.01,
		}).on('change', () => {
			filter.uniforms.uStrength.value = strength.value;
		});
	}
	/// #endif

	return api;
};
