import createFilter from '#webgl/utils/createFilter';
import { Vector2 } from 'three';

import CompositeFragment from './CompositePass.frag?hotshader';
import { useUnrealBloomPass } from './UnrealBloom';
import { useLutPass } from './LUT';
import { useDepthPass } from './Depth';
// import { useGrayscale } from './Grayscale';

// import GrayscaleFragment from './Grayscale/GrayscaleFragment.frag?hotshader';

import { prng } from '#utils/maths/prng.js';

const rf = prng.randomFloat;

export function composerPlugin(webgl) {
	const buffers = {};
	const filters = {};

	const uniforms = {};
	const defines = {};

	const api = {
		buffers,
		filters,

		uniforms,
		defines,

		resize,
		update,
		render,
	};

	function init() {
		const { $assets, $threeRenderer, $renderer, $hooks, $fbo } = webgl;
		const { textures } = $assets;

		buffers.composite = $fbo.createBuffer({ name: 'Composite' });
		buffers.base = $fbo.createBuffer({ name: 'Base' });
		buffers.mainBloom = $fbo.createBuffer({ name: 'Selective Bloom' });
		// buffers.depth = $fbo.createBuffer({ name: 'Detph' });

		Object.assign(uniforms, {
			...webgl.uniforms,
			tMap: { value: buffers.base.texture, type: 't' },
			tMapBloom: { value: buffers.mainBloom.texture, type: 't' },
			tComposite: { value: buffers.composite.texture, type: 't' },

			// Dither uniforms
			// uBlueNoiseMap: { value: textures['blue-noise'], type: 't' },
			uDitherOffset: { value: new Vector2() },
			uDitherStrength: { value: 1 },

			// Tint
			uBichromy: { value: 0.0 },
			uSaturation: { value: 1.0 },

			// // Grayscale
			// uGrayStrength: { value: 0.0 },
		});

		Object.assign(defines, { ...webgl.defines });

		filters.composite = createFilter({ uniforms, defines });
		CompositeFragment.use(filters.composite.material);

		// Grayscale pass
		// buffers.grayscale1 = $fbo.createBuffer({ name: 'Grayscale1' });
		// buffers.grayscale2 = $fbo.createBuffer({ name: 'Grayscale2' });
		// filters.grayscale = createFilter({
		// 	uniforms: {
		// 		...uniforms,
		// 		tMap: { value: null, type: 't' },
		// 	},
		// 	defines,
		// });
		// filters.grayscale.setMap = (map) => {
		// 	filters.grayscale.material.uniforms.tMap.value = map;
		// };
		// GrayscaleFragment.use(filters.grayscale.material);

		// useGrayscale(api);
		useDepthPass(api);
		useUnrealBloomPass(api);
		useLutPass(api);

		$renderer.drawingBufferSize.watchImmediate(resize);
		$hooks.beforeUpdate.watch(update);

		__DEBUG__ && devtools();
	}

	function resize({ width, height }) {
		if (!width || !height) return;

		buffers.base.setSize(width, height);
		api.$unrealBloom.resize(width, height);
	}

	function update() {
		const { $scenes } = webgl;
		$scenes.ui.component.triggerUpdate();
		uniforms.uDitherOffset.value.set(rf(0, 128), rf(0, 128));
	}

	function render() {
		const { $scenes } = webgl;
		const scene = $scenes.current.component;
		const renderer = webgl.$threeRenderer;

		// Render raw scene to main buffer
		// renderer.setRenderTarget(buffers.base);
		// renderer.clear();
		// scene.toggleSelectedBloom(false);
		// scene.triggerRender();
		// uniforms.tMap.value = buffers.base.texture;

		// // renderer.setRenderTarget(buffers.grayscale1);
		// // renderer.clear();
		// // filters.grayscale.setMap(buffers.base.texture);
		// // filters.grayscale.render();

		// // uniforms.tMap.value = buffers.grayscale1.texture;

		// // Render selected bloom to mainBloom buffer
		// renderer.setRenderTarget(buffers.mainBloom);
		// renderer.clear();
		// scene.toggleSelectedBloom(true);
		// scene.triggerRender();
		// renderer.clearDepth();
		// $scenes.ui.component.triggerRender();
		// uniforms.tMapBloom.value = buffers.mainBloom.texture;

		// renderer.setRenderTarget(buffers.grayscale2);
		// renderer.clear();
		// filters.grayscale.setMap(buffers.mainBloom.texture);
		// filters.grayscale.render();

		// uniforms.tMapBloom.value = buffers.grayscale2.texture;

		api.$depth.render(scene);

		renderer.setRenderTarget(buffers.base);
		renderer.clear();
		scene.toggleSelectedBloom(false);
		scene.triggerRender();
		renderer.clearDepth();
		$scenes.ui.component.triggerRender();
		uniforms.tMap.value = buffers.base.texture;

		// Render Unreal Bloom pass
		api.$unrealBloom.render(scene);

		// Render composite pass
		renderer.setRenderTarget(buffers.composite);
		renderer.clear();
		filters.composite.render();
		uniforms.tComposite.value = buffers.composite.texture;

		renderer.setRenderTarget(null);
		renderer.clear();
		// filters.composite.render();
		api.$lut.render();
		// filters.composite.render();
	}

	/// #if __DEBUG__
	function devtools() {
		const gui = webgl.$gui.addFolder({ title: '✨ Composer', index: 5 });
		const add = (obj, { label, min = 0, max = 1, step = 0.01 } = {}) =>
			gui.addBinding(obj, 'value', { label, min, max, step });

		api.$unrealBloom.devtools(gui);
		gui.addSeparator();
		api.$lut.devtools(gui);
		gui.addSeparator();
		api.$depth.devtools(gui);

		gui.addSeparator();
		add(uniforms.uDitherStrength, { label: 'Dither Strength', max: 2 });
		gui.addSeparator();
		add(uniforms.uBichromy, { label: 'Bichromy' });
		add(uniforms.uSaturation, { label: 'Saturation' });
	}
	/// #endif

	return {
		install: () => {
			webgl.$composer = api;
		},
		load: () => {
			webgl.$hooks.afterStart.watchOnce(init);
		},
	};
}
