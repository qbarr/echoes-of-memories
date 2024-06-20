import createFilter from '#webgl/utils/createFilter';
import { Vector2 } from 'three';

import { prng } from '#utils/maths/prng.js';
import { s, w } from '#utils/state';

import CompositePass from './CompositePass.frag?hotshader';
import { useAfterImagePass } from './AfterImage';
import { useBokehPass } from './Bokeh';
import { useCRTPass } from './CRT';
import { useDepthPass } from './Depth';
import { useLutPass } from './LUT';
import { useRGBShiftPass } from './RGBShift';
import { useSelectiveNormalPass } from './SelectiveNormal';
import { useSketchLinesPass } from './SketchLines';
import { useUnrealBloomPass } from './UnrealBloom';

const rf = prng.randomFloat;

export function composerPlugin(webgl) {
	const passes = [];
	const buffers = {};
	const filters = {};

	const uniforms = {};
	const defines = {};

	const enabled = w(true);

	let currentScene = null;

	const $hooks = { beforeRenderEmissive: s(), afterRenderEmissive: s() };

	const api = {
		buffers,
		filters,
		passes,

		uniforms,
		defines,

		$hooks,

		update,
		render,

		addOutline: (obj) => api.$selectiveNormal.add(obj),
		removeOutline: (obj) => api.$selectiveNormal.remove(obj),
	};

	function createSheets() {
		const project = webgl.$theatre.getProject('Transition-Memories');
		const sheet = project.getSheet('transition');
		sheet.$composer(['global', 'lut', 'crt']);
		// sheet.$bool('SwitchSceneParticles', { value: false }).onChange((v) => {
		// 	if (v) webgl.$scenes.switch('particle')
		// 	else webgl.$scenes.switch('bedroom')
		// });
	}

	function init() {
		const { $assets, $threeRenderer, $renderer, $hooks, $fbo } = webgl;
		const { textures } = $assets;

		buffers.base = $fbo.createBuffer({ name: 'Base' });
		buffers.emissive = $fbo.createBuffer({ name: 'Emissive' });
		buffers.interface = $fbo.createBuffer({ name: 'Interface' });
		buffers.composite = $fbo.createBuffer({ name: 'Composite' });

		Object.assign(uniforms, {
			...webgl.uniforms,
			tMap: { value: buffers.base.texture, type: 't' },
			tEmissive: { value: buffers.emissive.texture, type: 't' },
			tInterface: { value: buffers.interface.texture, type: 't' },
			tComposite: { value: buffers.composite.texture, type: 't' },

			// Dither uniforms
			uDitherOffset: { value: new Vector2() },
			uDitherStrength: { value: 0.2 },

			// Darkness
			uDarkness: { value: 0 },
			uPauseSaturation: { value: 0 },

			// Black stripes
			uStripesScale: { value: 0 },

			// Vignette
			uVignette: { value: new Vector2(0.171, 0) },
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
		passes.push(useAfterImagePass(api));
		passes.push(useUnrealBloomPass(api));
		passes.push(useCRTPass(api));
		passes.push(useLutPass(api));

		webgl.$scenes._current.watchImmediate(onSceneSwitch);

		// $renderer.drawingBufferSize.watchImmediate(resize);

		__DEBUG__ && devtools();
	}

	// Update parameters when scene changes
	function onSceneSwitch(scene) {
		currentScene = scene;
		const { name } = scene;
		const { $crt, $lut, $afterImage, $sketchLines, uniforms, $unrealBloom } = api;

		if (name === 'bedroom') {
			$crt.enabled.set(true);
			$lut.set('bedroom');
			$afterImage.enabled.set(false);
			$sketchLines.enabled.set(true);
			uniforms.SRGB_TRANSFER.value = 0;
		} else if (name === 'clinique') {
			$crt.enabled.set(false);
			$lut.set('clinique');
			$afterImage.enabled.set(false);
			$sketchLines.enabled.set(true);
			uniforms.SRGB_TRANSFER.value = 0;
		} else if (name === 'tv-room') {
			$crt.enabled.set(false);
			$lut.set('tv-room');
			$afterImage.enabled.set(false);
			$sketchLines.enabled.set(true);
			uniforms.SRGB_TRANSFER.value = 0;

			// bloom
			$unrealBloom.threshold.set(0.51);
			$unrealBloom.smoothing.set(0.74);
			$unrealBloom.strength.set(1.3);
			$unrealBloom.radius.set(1.39);
			$unrealBloom.spread.set(1.09);
		} else if (name.includes('flashback')) {
			$crt.enabled.set(true);
			$lut.set('neutral');
			// $lut.set('particle');
			$afterImage.enabled.set(true);
			$sketchLines.enabled.set(false);
			uniforms.SRGB_TRANSFER.value = 1;

			if(name === 'flashback1') {
				$unrealBloom.threshold.set(0.62);
			}
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

		// Render emissive pass
		$hooks.beforeRenderEmissive.emit();
		renderer.setRenderTarget(buffers.emissive);
		renderer.clear();
		scene.triggerRender();
		renderer.clearDepth();
		uniforms.tEmissive.value = buffers.emissive.texture;
		$hooks.afterRenderEmissive.emit();

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

		// Render after image pass
		api.$afterImage.render(scene);

		// Render RGB shift pass
		api.$rgbShift.render();

		// Render Unreal Bloom pass
		api.$unrealBloom.render();

		// Render VHS pass
		api.$crt.render();

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
			_gui.addBinding(obj, value, { label, min, max, step });
		};

		gui.addBinding(enabled, 'value', { label: 'Enabled' });

		add(uniforms.uDitherStrength, { label: 'Dithering', max: 2 });
		add(uniforms.uStripesScale, { label: 'Stripes', max: 1 });
		add(uniforms.uDarkness, { label: 'Darkness', max: 1 });
		add(uniforms.uPauseSaturation, { label: 'Pause Saturation', max: 1 });

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
			webgl.$hooks.afterStart.watchOnce(createSheets);
		},
	};
}
