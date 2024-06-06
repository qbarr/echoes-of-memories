import createFilter from '#webgl/utils/createFilter';
import { Vector2 } from 'three';

import { prng } from '#utils/maths/prng.js';

import CompositeFragment from './CompositePass.frag?hotshader';
import { useUnrealBloomPass } from './UnrealBloom';
import { useLutPass } from './LUT';
import { useDepthPass } from './Depth';
import { useVHSPass } from './VHS';
import { uniform } from '#webgl/utils/Uniform.js';

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

		Object.assign(uniforms, {
			...webgl.uniforms,
			tMap: { value: buffers.base.texture, type: 't' },
			tMapBloom: { value: buffers.mainBloom.texture, type: 't' },
			tComposite: { value: buffers.composite.texture, type: 't' },

			// Dither uniforms
			uDitherOffset: { value: new Vector2() },
			uDitherStrength: { value: 1 },
		});

		Object.assign(defines, { ...webgl.defines });

		filters.composite = createFilter({ uniforms, defines });
		CompositeFragment.use(filters.composite.material);

		passes.push(useDepthPass(api));
		passes.push(useUnrealBloomPass(api, { iterations: 3 }));
		passes.push(useLutPass(api));
		passes.push(useVHSPass(api));

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

		// Render depth pass
		api.$depth.render(scene);

		// Render base pass
		// with UI
		renderer.setRenderTarget(buffers.base);
		renderer.clear();
		scene.triggerRender();
		renderer.clearDepth();
		$scenes.ui.component.triggerRender();
		uniforms.tMap.value = buffers.base.texture;

		// Render VHS pass
		api.$vhs.render();

		// Render Unreal Bloom pass
		api.$unrealBloom.render(scene);

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
