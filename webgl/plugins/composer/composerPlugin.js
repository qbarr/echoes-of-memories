import createFilter from '#webgl/utils/createFilter';
import { MeshNormalMaterial, Vector2 } from 'three';

import { prng } from '#utils/maths/prng.js';
import { w } from '#utils/state';

import CompositePass from './CompositePass.frag?hotshader';
import { useBokehPass } from './Bokeh';
import { useCRTPass } from './CRT';
import { useDepthPass } from './Depth';
import { useLutPass } from './LUT';
import { useRGBShiftPass } from './RGBShift';
import { useSketchLinesPass } from './SketchLines';
import { useUnrealBloomPass } from './UnrealBloom';
import { useSelectiveNormalPass } from './SelectiveNormal';

const rf = prng.randomFloat;

export function composerPlugin(webgl) {
	const passes = [];
	const buffers = {};
	const filters = {};

	const uniforms = {};
	const defines = {};

	const enabled = w(true);

	let currentScene = null;

	const api = {
		buffers,
		filters,
		passes,

		uniforms,
		defines,

		update,
		render,

		addOutline: (obj) => api.$selectiveNormal.add(obj),
		removeOutline: (obj) => api.$selectiveNormal.remove(obj),
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

			// Black stripes
			uStripesScale: { value: 0 },

			// Vignette
			uVignette: { value: new Vector2() },
		});

		Object.assign(defines, { ...webgl.defines });

		filters.composite = createFilter({ uniforms, defines });
		CompositePass.use(filters.composite.material);

		// !! Order matters here !!
		passes.push(useDepthPass(api));
		passes.push(useSelectiveNormalPass(api));
		passes.push(useSketchLinesPass(api));
		passes.push(useBokehPass(api));
		passes.push(useRGBShiftPass(api));
		passes.push(useCRTPass(api));
		passes.push(useUnrealBloomPass(api));
		passes.push(useLutPass(api));

		webgl.$scenes._current.watchImmediate(onSceneSwitch);

		// $renderer.drawingBufferSize.watchImmediate(resize);

		__DEBUG__ && devtools();
	}

	// Update parameters when scene changes
	function onSceneSwitch(scene) {
		currentScene = scene;
		const { name } = scene;
		if (name === 'bedroom') {
			api.$crt.enabled.set(true);
		} else if (name === 'clinique') {
			api.$crt.enabled.set(false);
		}
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

		if (!enabled.value) return scene.triggerRender();

		// Render UI Scene
		renderer.setRenderTarget(buffers.interface);
		renderer.clear();
		$scenes.ui.component.triggerRender();
		uniforms.tInterface.value = buffers.interface.texture;

		// Render depth pass
		api.$depth.render(scene);

		// Render selective pass
		api.$selectiveNormal.render(scene);

		// Render base pass
		renderer.setRenderTarget(buffers.base);
		renderer.clear();
		scene.triggerRender();
		renderer.clearDepth();
		// $scenes.ui.component.triggerRender();
		uniforms.tMap.value = buffers.base.texture;

		// Render sketch lines pass
		api.$sketchLines.render(scene);

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

		// renderer.setRenderTarget(null);
		// renderer.clear();
		// scene.triggerRender();
	}

	/// #if __DEBUG__
	function devtools() {
		const gui = webgl.$gui.addFolder({ title: '✨ Composer', index: 5 });
		const add = (
			obj,
			{ value = 'value', label, min = 0, max = 1, step = 0.01 } = {},
			_gui = gui,
		) => {
			console.log(_gui);
			_gui.addBinding(obj, value, { label, min, max, step });
		};

		gui.addBinding(enabled, 'value', { label: 'Enabled' });

		add(uniforms.uDitherStrength, { label: 'Dithering', max: 2 });
		add(uniforms.uStripesScale, { label: 'Stripes', max: 1 });

		gui.addSeparator();

		const vGui = gui.addFolder({ title: '👁️ Vignette' });
		add(uniforms.uVignette.value, { value: 'x', label: 'Vignette Progress', max: 1 }, vGui); // prettier-ignore
		add(uniforms.uVignette.value, { value: 'y', label: 'Vignette Smoothness', max: 1 }, vGui); // prettier-ignore

		passes.forEach((pass) => pass.devtools?.(gui));
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
