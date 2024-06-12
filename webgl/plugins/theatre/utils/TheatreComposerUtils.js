import { getWebGL } from '#webgl/core/index.js';

export const convertComposerDatasForTheatre = (values) => {
	const webgl = getWebGL();
	const { $composer } = webgl;

	const { $bokeh, $lut, $unrealBloom, uniforms } = $composer;
	console.log($composer);

	const api = {
		global: {
			id: 'global',
			child: {
				dither: {
					value: uniforms.uDitherStrength,
					range: [0, 2],
				},
			},
		},
		bokeh: {
			id: 'bokeh',
			child: {
				amount: { value: $bokeh.amount, range: [0, 5] },
				strength: { value: $bokeh.strength, range: [0, 5] },
			},
		},
		lut: {
			id: 'lut',
			child: {
				saturation: { value: $lut.saturation, range: [0, 1] },
			},
		},
		bloom: {
			id: 'bloom',
			child: {
				threshold: { value: $unrealBloom.threshold, range: [0, 1] },
				smoothing: { value: $unrealBloom.smoothing, range: [0, 1] },
				strength: { value: $unrealBloom.strength, range: [0, 3] },
				radius: { value: $unrealBloom.radius, range: [0, 2] },
				spread: { value: $unrealBloom.spread, range: [0, 2] },
			},
		},
	};

	return values.map((key) => api[key]).filter(Boolean);
};
