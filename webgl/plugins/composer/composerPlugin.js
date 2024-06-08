import createFilter from '#webgl/utils/createFilter';
import { Vector2 } from 'three';

import { prng } from '#utils/maths/prng.js';

import CompositeFragment from './CompositePass.frag?hotshader';
import { useDepthPass } from './Depth';
import { useLutPass } from './LUT';
import { useRGBShiftPass } from './RGBShift';
import { useUnrealBloomPass } from './UnrealBloom';
import { useCRTPass } from './CRT';
import { useBokehPass } from './Bokeh';

const rf = prng.randomFloat;

export function composerPlugin(webgl) {
	const buffers = {};
	const filters = {};

	const uniforms = {};
	const defines = {};

	const passes = [];

	const api = {
		buffers,
		filters,
		passes,

		uniforms,
		defines,

		update,
		render,
	};

	function init() {
		const { $assets, $threeRenderer, $renderer, $hooks, $fbo } = webgl;
		const { textures } = $assets;

		buffers.base = $fbo.createBuffer({ name: 'Base' });
		buffers.interface = $fbo.createBuffer({ name: 'Interface' });
		buffers.composite = $fbo.createBuffer({ name: 'Composite' });

		Object.assign(uniforms, {
			...webgl.uniforms,
			tMap: { value: buffers.base.texture, type: 't' },
			tInterface: { value: buffers.interface.texture, type: 't' },
			tComposite: { value: buffers.composite.texture, type: 't' },

			// Dither uniforms
			uDitherOffset: { value: new Vector2() },
			uDitherStrength: { value: 1 },
		});

		Object.assign(defines, { ...webgl.defines });

		filters.composite = createFilter({ uniforms, defines });
		CompositeFragment.use(filters.composite.material);

		passes.push(useDepthPass(api));
		passes.push(useBokehPass(api));
		passes.push(useRGBShiftPass(api));
		passes.push(useCRTPass(api));
		passes.push(useUnrealBloomPass(api));
		passes.push(useLutPass(api));

		// $renderer.drawingBufferSize.watchImmediate(resize);
		$hooks.beforeUpdate.watch(update);

		__DEBUG__ && devtools();
	}

	// function resize({ width, height }) {
	// 	if (!width || !height) return;
	// }

	function update() {
		const { $scenes } = webgl;
		$scenes.ui.component.triggerUpdate();
		uniforms.uDitherOffset.value.set(rf(0, 128), rf(0, 128));
	}

	function render() {
		const { $scenes } = webgl;
		const scene = $scenes.current.component;
		const renderer = webgl.$threeRenderer;

		// Render UI Scene
		renderer.setRenderTarget(buffers.interface);
		renderer.clear();
		$scenes.ui.component.triggerRender();
		uniforms.tInterface.value = buffers.interface.texture;

		// Render depth pass
		api.$depth.render(scene);

		// Render base pass
		renderer.setRenderTarget(buffers.base);
		renderer.clear();
		scene.triggerRender();
		renderer.clearDepth();
		$scenes.ui.component.triggerRender();
		uniforms.tMap.value = buffers.base.texture;

		// Render Bokeh pass
		api.$bokeh.render();

		// Render RGB shift pass
		api.$rgbShift.render();

		// Render VHS pass
		api.$crt.render();

		// Render Unreal Bloom pass
		api.$unrealBloom.render();

		// Render composite pass
		renderer.setRenderTarget(buffers.composite);
		renderer.clear();
		filters.composite.render();
		uniforms.tComposite.value = buffers.composite.texture;

		// Render LUT pass
		renderer.setRenderTarget(null);
		renderer.clear();
		api.$lut.render();
	}

	/// #if __DEBUG__
	function devtools() {
		const gui = webgl.$gui.addFolder({ title: '✨ Composer', index: 5 });
		const add = (obj, { label, min = 0, max = 1, step = 0.01 } = {}) =>
			gui.addBinding(obj, 'value', { label, min, max, step });

		add(uniforms.uDitherStrength, { label: 'Dithering', max: 2 });
		gui.addSeparator();

		passes.forEach((pass) => pass.devtools(gui));
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
